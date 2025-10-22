from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import requests
from bs4 import BeautifulSoup
import re
from pydantic import BaseModel
import time
import random
import os
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv
import json
import io
import PyPDF2
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Optional, Dict, Any
from urllib.parse import urljoin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:5173/home",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

embedding_model = None
pdf_cache = {}

class URLRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    paper_title: str
    paper_abstract: str
    messages: list
    pdf_url: Optional[str] = None

class PDFProcessRequest(BaseModel):
    pdf_url: str
    ignore_pages: Optional[str] = "none"

def init_embedding_model():
    global embedding_model
    try:
        logger.info("Loading sentence-transformers model...")
        embedding_model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
        logger.info("Embedding model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")

def normalize_input_path(file_or_url: str) -> str:
    file_or_url = file_or_url.strip()
    if file_or_url.startswith("www."):
        return "https://" + file_or_url
    if file_or_url.startswith("arxiv.org"):
        return "https://" + file_or_url
    return file_or_url

def is_pdf_content_type(headers: dict) -> bool:
    ctype = headers.get("Content-Type", "")
    return "pdf" in ctype.lower()

def extract_text_by_pages(file_or_url: str) -> List[str]:
    """Extract text from PDF, returning list of page texts"""
    file_or_url = normalize_input_path(file_or_url)
    pages_text = []
    
    if file_or_url.startswith("http"):
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/117.0.0.0 Safari/537.36"
            )
        }
        resp = requests.get(file_or_url, headers=headers, stream=True, timeout=30)
        resp.raise_for_status()
        
        if not is_pdf_content_type(resp.headers):
            raise ValueError("URL does not return PDF content")
        
        file_stream = io.BytesIO(resp.content)
        reader = PyPDF2.PdfReader(file_stream)
    else:
        if not os.path.exists(file_or_url):
            raise FileNotFoundError(f"File not found: {file_or_url}")
        reader = PyPDF2.PdfReader(file_or_url)
    
    for page_num, page in enumerate(reader.pages):
        try:
            text = page.extract_text() or ""
            pages_text.append(text.strip())
        except Exception as e:
            logger.warning(f"Failed to extract text from page {page_num}: {e}")
            pages_text.append("")
    
    return pages_text

def parse_ignore_pages_input(user_input: str, total_pages: int) -> set:
    """Parse user input for pages to ignore"""
    user_input = user_input.strip().lower()
    if user_input in ("none", ""):
        return set()
    if user_input == "all":
        return set(range(total_pages))
    
    parts = [p.strip() for p in user_input.split(",") if p.strip()]
    ignore_set = set()
    
    for p in parts:
        if "-" in p:
            try:
                start, end = p.split("-", 1)
                s = int(start)
                e = int(end)
                if s <= 0 or e <= 0:
                    continue
                for i in range(max(1, s), min(e, total_pages) + 1):
                    ignore_set.add(i - 1)
            except ValueError:
                continue
        else:
            if p.isdigit():
                n = int(p)
                if 1 <= n <= total_pages:
                    ignore_set.add(n - 1)
    
    return ignore_set

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 60) -> List[str]:
    """Chunk text into overlapping segments"""
    words = text.split()
    if not words:
        return []
    
    chunks = []
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks

def get_embeddings(texts: List[str]) -> np.ndarray:
    """Get embeddings for texts"""
    if embedding_model is None:
        raise RuntimeError("Embedding model not initialized")
    return np.array(embedding_model.encode(texts, convert_to_numpy=True), dtype="float32")

def build_faiss_index(chunks: List[str]) -> tuple:
    """Build FAISS index for chunks"""
    if not chunks:
        raise ValueError("No chunks to index")
    
    embeddings = get_embeddings(chunks)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    
    return index, embeddings, chunks

def process_pdf(pdf_url: str, ignore_pages: str = "none") -> Dict[str, Any]:
    """Process PDF and return chunks with index"""
    try:
        pages = extract_text_by_pages(pdf_url)
        total_pages = len(pages)
        
        if total_pages == 0:
            raise ValueError("No pages found in PDF")
        
        ignore_set = parse_ignore_pages_input(ignore_pages, total_pages)
        
        pages_to_embed = [p for idx, p in enumerate(pages) if idx not in ignore_set and p.strip()]
        
        if not pages_to_embed:
            raise ValueError("No valid pages to process after filtering")
        
        text_to_embed = "\n".join(pages_to_embed)
        chunks = chunk_text(text_to_embed)
        
        if not chunks:
            raise ValueError("No text chunks created")
        
        index, embeddings, processed_chunks = build_faiss_index(chunks)
        
        return {
            "index": index,
            "embeddings": embeddings,
            "chunks": processed_chunks,
            "total_pages": total_pages,
            "processed_pages": len(pages_to_embed),
            "ignored_pages": len(ignore_set),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        return {
            "status": "failed",
            "error": str(e)
        }

def search_pdf_chunks(query: str, pdf_data: Dict[str, Any], top_k: int = 8) -> List[str]:
    """Search PDF chunks for relevant context"""
    try:
        q_emb = get_embeddings([query])
        index = pdf_data["index"]
        chunks = pdf_data["chunks"]
        
        k = min(top_k, len(chunks))
        distances, indices = index.search(np.array(q_emb, dtype="float32"), k)
        
        retrieved_chunks = []
        seen_indices = set()
        
        for i in indices[0]:
            if i not in seen_indices and i < len(chunks):
                retrieved_chunks.append(chunks[i])
                seen_indices.add(i)
        
        return retrieved_chunks
    
    except Exception as e:
        logger.error(f"PDF search failed: {e}")
        return []

@app.on_event("startup")
async def startup_event():
    init_embedding_model()

@app.get("/")
async def root():
    return {"message": "Enhanced PDF Resolution API is running"}

@app.post("/resolve-pdf")
async def resolve_pdf(request: URLRequest):
    url = request.url
    if not url.startswith("http"):
        url = "https://" + url

    arxiv_match = re.match(r'https?://arxiv\.org/(abs|pdf)/([\d\.v-]+)', url)
    if arxiv_match:
        arxiv_id = arxiv_match.group(2)
        return {
            "pdfLink": f"https://arxiv.org/pdf/{arxiv_id}.pdf", 
            "source": "ARXIV_DIRECT",
            "sourceName": "Direct arXiv PDF Conversion"
        }

    if "semanticscholar.org" in url:
        paper_id_match = re.search(r"semanticscholar\.org/paper/(?:.*?/)?([a-f0-9]{40})", url)
        paper_id = paper_id_match.group(1) if paper_id_match else None
        
        try:
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/117.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
            r = requests.get(url, headers=headers, timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            base_url = r.url  # Get final URL after redirects

            fallback_non_pdf = None

            # Case-insensitive search for citation_pdf_url
            meta = soup.find("meta", attrs={"name": lambda n: n and n.lower() == "citation_pdf_url"})
            if meta and meta.get("content"):
                pdf_link = meta["content"].strip()
                pdf_link = urljoin(base_url, pdf_link)  # Resolve relative URL
                if pdf_link.lower().endswith(".pdf") or "arxiv.org/pdf" in pdf_link:
                    return {
                        "pdfLink": pdf_link,
                        "source": "SEMANTIC_SCRAPE",
                        "sourceName": "Semantic Scholar Scraping (citation_pdf_url)"
                    }
                else:
                    fallback_non_pdf = pdf_link

            # Generic scan for PDFs with absolute URL resolution
            for a in soup.find_all("a", href=True):
                href = a["href"]
                absolute_href = urljoin(base_url, href)
                if absolute_href.lower().endswith(".pdf") or "arxiv.org/pdf" in absolute_href:
                    return {
                        "pdfLink": absolute_href,
                        "source": "SEMANTIC_SCRAPE",
                        "sourceName": "Semantic Scholar Scraping (generic scan)"
                    }

            # Fallback to non-PDF citation URL if found
            if fallback_non_pdf:
                return {
                    "pdfLink": fallback_non_pdf,
                    "source": "SEMANTIC_SCRAPE",
                    "sourceName": "Semantic Scholar Scraping (non-pdf fallback)"
                }

            return {
                "pdfLink": url,
                "source": "ORIGINAL_URL",
                "sourceName": "Original URL (no PDF found)"
            }

        except Exception as e:
            logger.error(f"Failed scraping Semantic Scholar: {e}")
            return {
                "pdfLink": url,
                "source": "ORIGINAL_URL",
                "sourceName": "Original URL (scraping failed)"
            }


@app.post("/process-pdf")
async def process_pdf_endpoint(request: PDFProcessRequest):
    """Process PDF and store in cache for later use"""
    try:
        if embedding_model is None:
            raise HTTPException(status_code=500, detail="Embedding model not initialized")
        
        pdf_data = process_pdf(request.pdf_url, request.ignore_pages)
        
        if pdf_data["status"] == "failed":
            raise HTTPException(status_code=400, detail=pdf_data["error"])
        
        cache_key = f"pdf_{hash(request.pdf_url)}"
        pdf_cache[cache_key] = pdf_data
        
        return {
            "cache_key": cache_key,
            "total_pages": pdf_data["total_pages"],
            "processed_pages": pdf_data["processed_pages"],
            "ignored_pages": pdf_data["ignored_pages"],
            "chunks_created": len(pdf_data["chunks"]),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"PDF processing endpoint failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat-with-ai")
async def chat_with_ai(request: ChatRequest):
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not openrouter_api_key and not groq_api_key:
        return {"error": "No API keys found in environment variables"}
    
    use_pdf = False
    pdf_context = ""
    context_source = "abstract and title"
    
    if request.pdf_url and embedding_model is not None:
        try:
            cache_key = f"pdf_{hash(request.pdf_url)}"
            
            if cache_key not in pdf_cache:
                pdf_data = process_pdf(request.pdf_url, "none")
                if pdf_data["status"] == "success":
                    pdf_cache[cache_key] = pdf_data
            
            if cache_key in pdf_cache:
                user_messages = [msg for msg in request.messages if msg["role"] == "user"]
                if user_messages:
                    last_query = user_messages[-1]["content"]
                    relevant_chunks = search_pdf_chunks(last_query, pdf_cache[cache_key])
                    
                    if relevant_chunks:
                        pdf_context = "\n\n".join(relevant_chunks)
                        use_pdf = True
                        context_source = "PDF content"
        
        except Exception as e:
            logger.error(f"PDF processing for chat failed: {e}")
    
    if use_pdf:
        system_content = f"You are the best research paper explainer in the world.\n\n" \
                        f"Paper Title: {request.paper_title}\n\n" \
                        f"PDF Content (relevant sections):\n{pdf_context}\n\n" \
                        f"You are chatting with PDF content. Answer based on the PDF content provided above."
    else:
        system_content = f"You are the best research paper explainer in the world.\n\n" \
                        f"Paper Title: {request.paper_title}\n" \
                        f"Paper Abstract: {request.paper_abstract}\n\n" \
                        f"You are chatting with abstract and title only (PDF not available). Answer based on the title and abstract provided."
    
    system_message = {
        "role": "system",
        "content": system_content
    }
    messages = [system_message] + request.messages

    if openrouter_api_key:
        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                data=json.dumps({
                    "model": "meta-llama/llama-4-maverick:free",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1024,
                    "top_p": 1,
                    "stream": True
                }),
                stream=True
            )

            if response.status_code != 200:
                error_data = response.json()
                if response.status_code == 429:
                    logger.info("OpenRouter rate limit exceeded, falling back to Groq")
                    raise Exception("Rate limit exceeded, falling back to Groq")
                else:
                    return {
                        "error": f"OpenRouter returned {response.status_code}",
                        "details": response.text
                    }

            async def stream_openrouter_response():
                yield f"[Chatting with {context_source}]\n\n"
                
                for line in response.iter_lines():
                    if line:
                        decoded_line = line.decode("utf-8")
                        if decoded_line.startswith("data: "):
                            json_str = decoded_line[6:]
                            if json_str != "[DONE]":
                                try:
                                    data = json.loads(json_str)
                                    content = data["choices"][0]["delta"].get("content", "")
                                    if content:
                                        yield content
                                except json.JSONDecodeError:
                                    continue

            return StreamingResponse(stream_openrouter_response(), media_type="text/plain")

        except Exception as e:
            logger.error(f"OpenRouter failed: {e}, falling back to Groq")

    if groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            
            completion = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=messages,
                temperature=0.7,
                max_completion_tokens=1024,
                top_p=1,
                stream=True,
                stop=None
            )
            
            async def stream_groq_response():
                yield f"[Chatting with {context_source}]\n\n"
                
                for chunk in completion:
                    content = chunk.choices[0].delta.content
                    if content is not None:
                        yield content
            
            return StreamingResponse(stream_groq_response(), media_type="text/plain")
            
        except Exception as e:
            logger.error(f"Groq also failed: {e}")
            return {"error": "Both OpenRouter and Groq failed", "details": str(e)}
    
    return {"error": "No working AI service available"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
