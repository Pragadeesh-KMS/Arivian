import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Maximize2, Minimize2, FileText, Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { Paper } from '../types/paper';
import { ChatMessage } from './PaperCard';

interface AIChatProps {
  paper: Paper;
  pdfInfo: { url: string; source: string } | null;
  onClose: () => void;
  isOpen: boolean;
}

interface PDFProcessStatus {
  status: 'idle' | 'processing' | 'success' | 'failed';
  error?: string;
  totalPages?: number;
  processedPages?: number;
  chunksCreated?: number;
}

const formatMessage = (text: string) => {
  if (!text) return "";
  let formatted = text;
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/^\* (.*)$/gm, "<li>$1</li>");
  if (formatted.includes("<li>")) {
    formatted = `<ul>${formatted}</ul>`;
  }
  formatted = formatted.replace(/_(.*?)_/g, "<em>$1</em>");
  formatted = formatted.replace(/\n/g, "<br/>");
  return formatted;
};

const AIChat: React.FC<AIChatProps> = ({ paper, pdfInfo, onClose, isOpen }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [pdfPanelExpanded, setPdfPanelExpanded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'abstract' | 'pdf'>('abstract');
  const [showPdfSettings, setShowPdfSettings] = useState(false);
  const [ignorePagesInput, setIgnorePagesInput] = useState('none');
  const [pdfProcessStatus, setPdfProcessStatus] = useState<PDFProcessStatus>({ status: 'idle' });
  const [isPdfProcessed, setIsPdfProcessed] = useState(false);
  const [contextSource, setContextSource] = useState<'abstract' | 'pdf'>('abstract');

  const isEmbeddablePdf = (url: string) => {
    if (url.endsWith('.pdf') || url.includes('arxiv.org')) return true;
    
    const blockedDomains = [
      'ieeexplore.ieee.org',
      'acm.org',
      'springer.com',
      'sciencedirect.com',
      'tandfonline.com',
      'wiley.com'
    ];
    
    return !blockedDomains.some(domain => url.includes(domain));
  };

  useEffect(() => {
    setIframeError(false);
    setPdfProcessStatus({ status: 'idle' });
    setIsPdfProcessed(false);
    setContextSource('abstract');
  }, [pdfInfo]);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const processPDF = async () => {
    if (!pdfInfo?.url) return;

    setPdfProcessStatus({ status: 'processing' });
    
    try {
      const response = await fetch('http://localhost:8000/process-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf_url: pdfInfo.url,
          ignore_pages: ignorePagesInput
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'PDF processing failed');
      }

      setPdfProcessStatus({
        status: 'success',
        totalPages: data.total_pages,
        processedPages: data.processed_pages,
        chunksCreated: data.chunks_created
      });
      
      setIsPdfProcessed(true);
      setContextSource('pdf');
      setShowPdfSettings(false);
      
    } catch (error) {
      console.error('PDF processing error:', error);
      setPdfProcessStatus({
        status: 'failed',
        error: error.message || 'Failed to process PDF'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoadingChat || chatCount >= 5) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoadingChat(true);
    setChatCount(prev => prev + 1);
    
    try {
      const response = await fetch('http://localhost:8000/chat-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper_title: paper.title,
          paper_abstract: paper.abstract || 'No abstract available',
          messages: [...chatMessages, userMessage],
          pdf_url: isPdfProcessed ? pdfInfo?.url : null
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
        
        setChatMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.role === 'assistant') {
            newMessages[newMessages.length - 1].content = aiResponse;
          } else {
            newMessages.push({ role: 'assistant', content: aiResponse });
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResize = (e: MouseEvent) => {
    if (isResizing) {
      const container = document.getElementById('chat-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const percentage = (relativeX / containerRect.width) * 100;
        setLeftPanelWidth(Math.max(20, Math.min(80, percentage)));
      }
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResizing);
  };

  if (!isOpen) return null;

  const showPdf = pdfInfo && !iframeError && isEmbeddablePdf(pdfInfo.url);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-70">
      <div className="flex justify-between items-center p-2 bg-slate-800 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Chat with AI about this Paper</h2>
          {/* Add this toggle button section */}
          {pdfInfo && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'abstract' ? 'pdf' : 'abstract')}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {viewMode === 'abstract' ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>View PDF</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>View Abstract</span>
                  </>
                )}
              </button>
              {contextSource === 'pdf' ? (
                <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Chatting with PDF</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-orange-500 px-3 py-1 rounded-full text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Chatting with Abstract</span>
                </div>
              )}
              <button
                onClick={() => setShowPdfSettings(true)}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                title="Configure PDF Processing"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Update the left panel condition to use viewMode */}
      <div className="flex flex-1 overflow-hidden" id="chat-container">
        <div 
          className="h-full overflow-auto bg-white transition-all duration-300"
          style={{ 
            width: pdfPanelExpanded ? '100%' : `${leftPanelWidth}%`,
            display: pdfPanelExpanded ? 'block' : 'flex',
            flexDirection: 'column'
          }}
        >
          {viewMode === 'pdf' && showPdf ? ( // Changed condition to use viewMode
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">PDF from {pdfInfo.source}</span>
                  {pdfProcessStatus.status === 'success' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {pdfProcessStatus.chunksCreated} chunks ready
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setPdfPanelExpanded(!pdfPanelExpanded)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title={pdfPanelExpanded ? "Show Chat" : "Expand PDF"}
                >
                  {pdfPanelExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
              <iframe
                ref={iframeRef}
                src={pdfInfo.url}
                className="w-full flex-1 border-0"
                title="PDF Viewer"
                onError={handleIframeError}
                onLoad={(e) => {
                  try {
                    const iframe = e.target as HTMLIFrameElement;
                    if (iframe.contentDocument && iframe.contentDocument.body.innerHTML.includes('refused to connect')) {
                      handleIframeError();
                    }
                  } catch (error) {
                    handleIframeError();
                  }
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 h-full overflow-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold text-slate-800 text-lg">Paper Details</h3>
              </div>
              
              <h4 className="font-semibold text-slate-700 text-base mb-3">
                {paper.title}
              </h4>
              
              <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                {paper.citationCount > 0 ? (
                  <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {paper.citationCount} citations
                  </span>
                ) : (
                  <span className="font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    Preprint
                  </span>
                )}
                <span>
                  {paper.published ? new Date(paper.published).toLocaleDateString() : 'Unknown date'}
                </span>
              </div>
              
              <div className="mb-4">
                <h5 className="font-medium text-slate-700 mb-2">Abstract:</h5>
                <p className="text-sm text-slate-600">
                  {paper.abstract || 'No abstract available'}
                </p>
              </div>
              
              <div className="text-sm text-slate-600">
                <h5 className="font-medium text-slate-700 mb-1">Authors:</h5>
                <p className="italic">
                  {paper.authors.join(', ')}
                </p>
              </div>

              {pdfInfo && iframeError && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800">
                    PDF cannot be displayed directly. <a 
                      href={pdfInfo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open in new tab
                    </a>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Resizable divider (only show when not expanded) */}
        {!pdfPanelExpanded && (
          <div 
            className="w-2 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors"
            onMouseDown={startResizing}
          />
        )}

        {/* Right Panel (only show when not expanded) */}
        {!pdfPanelExpanded && (
          <div 
            className="h-full overflow-hidden flex flex-col transition-all duration-300 bg-white"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Ask me anything about this paper!</p>
                  <p className="text-sm mt-2">You have {5 - chatCount} questions remaining</p>
                  {pdfInfo && !isPdfProcessed && (
                    <div className="mt-4 p-3 bg-teal-50 border border-teal-400 rounded-lg">
                      <p className="text-sm text-teal-700 mb-2">
                        Currently using <strong>Abstract</strong> as the knowledge base.
                      </p>
                      <button
                        onClick={() => setShowPdfSettings(true)}
                        className="text-teal-600 hover:text-orange-600 underline text-sm"
                      >
                        Configure PDF processing
                      </button>
                      <span className="text-sm text-teal-700 ml-1">
                        to chat with the full paper content.
                      </span>
                    </div>                  
                  )}
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg max-w-3/4 ${message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-slate-100'}`}
                  >
                    <p
                      className="text-slate-800 whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  </div>
                ))
              )}
              {isLoadingChat && (
                <div className="p-4 rounded-lg bg-slate-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={chatCount >= 5 ? "You've reached the maximum of 5 questions" : "Ask a question about this paper..."}
                  disabled={isLoadingChat || chatCount >= 5}
                  className="flex-1 p-3 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoadingChat || !currentMessage.trim() || chatCount >= 5}
                  className="p-3 bg-blue-500 text-white rounded-r-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {chatCount > 0 && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  {chatCount} of 5 questions used
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PDF Processing Settings Modal */}
      {showPdfSettings && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-80">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Configure PDF Processing</h3>
              <button
                onClick={() => setShowPdfSettings(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                Choose which pages to exclude from processing. This helps focus on relevant content and improves response quality.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pages to ignore:
                  </label>
                  <input
                    type="text"
                    value={ignorePagesInput}
                    onChange={(e) => setIgnorePagesInput(e.target.value)}
                    placeholder="e.g., 1,3,5-8 or 'none' or 'all'"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Examples: "none" (process all), "1,3,5-8" (ignore pages 1, 3, and 5 through 8), "all" (ignore all pages)
                  </p>
                </div>
              </div>
            </div>

            {pdfProcessStatus.status !== 'idle' && (
              <div className="mb-4 p-3 rounded-lg border">
                {pdfProcessStatus.status === 'processing' && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing PDF...</span>
                  </div>
                )}
                
                {pdfProcessStatus.status === 'success' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">PDF processed successfully!</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>Total pages: {pdfProcessStatus.totalPages}</p>
                      <p>Processed pages: {pdfProcessStatus.processedPages}</p>
                      <p>Text chunks created: {pdfProcessStatus.chunksCreated}</p>
                    </div>
                  </div>
                )}
                
                {pdfProcessStatus.status === 'failed' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">Processing failed</p>
                      <p className="text-xs">{pdfProcessStatus.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPdfSettings(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={processPDF}
                disabled={pdfProcessStatus.status === 'processing'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {pdfProcessStatus.status === 'processing' ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process PDF'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIChat;