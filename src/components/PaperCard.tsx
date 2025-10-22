import React, { useState, useEffect } from 'react';
import { Heart, X, Tag, Check, FileText, BookOpen, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Paper } from '../types/paper';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getDirectPdfLink } from '../services/pdfResolver'; 
import PdfNotification from './PdfNotification';
import AIChat from './AIChat';
import Recommendations from './Recommendations';
import { setCurrentNotification } from '../utils/notificationState';

interface PaperCardProps {
  paper: Paper;
  onRemove?: (paperId: string) => void;
  showHeartAsSaved?: boolean;
  showBookAsSaved?: boolean;
  onTagsUpdated?: () => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const PaperCard = ({ 
  paper, 
  onRemove,
  showBookAsSaved = false,
  onTagsUpdated
}: PaperCardProps) => {
  const { 
    user, 
    savePaper, 
    savedPaperIds, 
    updatePaperTags,
    getUserTags
  } = useAuth();

  const [showTagEditor, setShowTagEditor] = useState(false);
  const [paperTags, setPaperTags] = useState<string[]>(paper.tags || []);
  const [newTag, setNewTag] = useState('');
  const [userTags, setUserTags] = useState<string[]>([]);
  const [isSavingForTagging, setIsSavingForTagging] = useState(false);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [loadingUserTags, setLoadingUserTags] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfNotification, setShowPdfNotification] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<{url: string; source: string} | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [resolvedPdfInfo, setResolvedPdfInfo] = useState<{url: string; source: string} | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const isSaved = savedPaperIds.has(paper.id);
  const source = paper.source || (paper.id.startsWith('arXiv:') ? 'arxiv' : 'semantic-scholar');

  useEffect(() => {
    if (isSaved && user) {
      fetchPaperTags();
    }
  }, [isSaved, user]);

  useEffect(() => {
    if (pdfInfo) {
      setResolvedPdfInfo(pdfInfo);
    }
  }, [pdfInfo]);

  const fetchPaperTags = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_papers')
        .select('tags')
        .eq('user_id', user.id)
        .eq('paper_id', paper.id)
        .single();

      if (!error && data) {
        setPaperTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching paper tags:', error);
    }
  };

  const fetchUserTags = async () => {
    setLoadingUserTags(true);
    try {
      const tags = await getUserTags();
      setUserTags(tags);
    } catch (error) {
      console.error('Error fetching user tags:', error);
      toast.error('Failed to load your tags');
    } finally {
      setLoadingUserTags(false);
    }
  };

  const handleSavePaper = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const paperData = {
      paper_id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      published: paper.published,
      url: paper.url,
      externalIds: paper.externalIds || null,
      source
    };
    
    await savePaper(paperData);
    
    if (isSaved && onRemove) {
      onRemove(paper.id);
    }
  };

  const handleTagClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to tag papers');
      return;
    }
    await fetchUserTags();
    
    if (isSaved) {
      setPendingTags(paperTags);
    } else {
      setPendingTags([]);
    }
    
    setShowTagEditor(true);
  };

  const handleAddPendingTag = (tagToAdd: string) => {
    if (!tagToAdd.trim()) return;
    
    const tag = tagToAdd.trim();
    if (!pendingTags.includes(tag)) {
      setPendingTags([...pendingTags, tag]);
    }
    setNewTag('');
  };

  const handleRemovePendingTag = (tagToRemove: string) => {
    setPendingTags(pendingTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitTags = async () => {
    setIsSavingForTagging(true);
    try {
      if (!isSaved) {
        const paperData = {
          paper_id: paper.id,
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          url: paper.url,
          source
        };
        
        const success = await savePaper(paperData);
        if (!success) {
          throw new Error('Failed to save paper');
        }
      }
      
      const success = await updatePaperTags(paper.id, pendingTags);
      
      if (success) {
        setPaperTags(pendingTags);
        setShowTagEditor(false);
        toast.success('Tags Updated successfully!');
        
        fetchUserTags();
        if (onTagsUpdated) {
          onTagsUpdated();
        }
      } else {
        throw new Error('Failed to update tags');
      }
    } catch (error) {
      console.error('Error saving paper or tags:', error);
      toast.error('Failed to save paper or tags');
    } finally {
      setIsSavingForTagging(false);
    }
  };

  const handleOpenPaper = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentNotification(null);
    
    // First check if we have external IDs to generate PDF links directly
    if (paper.externalIds) {
      let pdfLink: string | null = null;
      let sourceName: string | null = null;
  
      if (paper.externalIds.ArXiv) {
        pdfLink = `https://arxiv.org/pdf/${paper.externalIds.ArXiv}.pdf`;
        sourceName = 'arXiv';
      } else if (paper.externalIds.ACL) {
        pdfLink = `https://aclanthology.org/${paper.externalIds.ACL}.pdf`;
        sourceName = 'ACL Anthology';
      } else if (paper.externalIds.PubMedCentral) {
        pdfLink = `https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.externalIds.PubMedCentral}/pdf/`;
        sourceName = 'PubMed Central';
      }
  
      if (pdfLink && sourceName) {
        const pdfInfo = {
          url: pdfLink,
          source: sourceName
        };
        
        // Set both pdfInfo states to ensure consistency
        setPdfInfo(pdfInfo);
        setResolvedPdfInfo(pdfInfo);
        setShowPdfNotification(true);
        return;
      }
    }
  
    // If no external IDs are available, use the API which will handle scraping
    const toastId = toast.loading('Resolving PDF...');
    try {
      const { pdfLink, sourceName } = await getDirectPdfLink(paper.url);
      
      if (pdfLink) {
        const pdfInfo = {
          url: pdfLink,
          source: sourceName || 'Unknown source'
        };
        
        // Set both pdfInfo states to ensure consistency
        setPdfInfo(pdfInfo);
        setResolvedPdfInfo(pdfInfo);
        setShowPdfNotification(true);
        
        toast.dismiss(toastId);
      } else {
        window.open(paper.url, "_blank");
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.error("Error opening paper:", err);
      window.open(paper.url, "_blank");
      toast.dismiss(toastId);
    }
  };

  const handleOpenPdf = () => {
    if (pdfInfo) {
      window.open(pdfInfo.url, "_blank");
    }
  };

  const handleDismissNotification = () => {
    setShowPdfNotification(false);
  };

  const handleChatWithAI = () => {
    setShowChat(true);
  };

  const handleRecommendations = () => {
    setShowRecommendations(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 rounded-xl h-full flex flex-col relative"
      >
        {paperTags.length > 0 && (
          <div className="absolute -top-3 left-4 right-4 flex flex-wrap justify-end gap-1 z-10">
            {paperTags.map(tag => (
              <span 
                key={tag}
                className="bg-gradient-to-tr from-teal-400 to-purple-500 text-white px-2 py-1 rounded-md text-xs font-medium shadow-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <button 
              onClick={handleSavePaper}
              className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
              title={isSaved ? "Remove from Saved" : "Save to My Interests"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
            </button>
            {/* tag button */}
            <button 
              onClick={handleTagClick}
              className={`p-1 rounded-full transition-colors ${
                isSaved 
                  ? 'text-green-500 hover:bg-green-100' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title={isSaved ? "Add tags to this paper" : "Tag this paper"}
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
          
          {/* AI Button */}
          <motion.button
            onClick={handleOpenPaper}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-1.5 rounded-xl overflow-hidden group"
            title="Open PDF"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/30 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
            <div className="absolute inset-0 rounded-xl border border-white/10" />
            <div className="absolute inset-0 rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-20 rounded-xl" />
            </div>
            
            {/* Content */}
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="w-3 h-3 drop-shadow-md"
              />
            </div>
          </motion.button>
        </div>
        
        <div className="flex-1 mt-2">
          <h3 className="font-bold text-slate-800 line-clamp-2 text-base leading-tight mb-3">
            {paper.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
            {paper.citationCount > 0 ? (
              <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                {paper.citationCount} citations
              </span>
            ) : paper.source === 'arxiv' ? (
              <span className="text-s font-small bg-pink-100 text-slate-700 px-1 py-0 rounded">
                ArXiv: {paper.id}
              </span>
            ) : paper.source === 'semantic-scholar' ? (
              <span className="text-s font-small bg-teal-100 text-slate-700 px-1 py-0 rounded">
                Semantic Scholar
              </span>
            ) : (
              <span className="font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
                Preprint
              </span>
            )}
            <span>
              {paper.published 
                ? (/^\d{4}$/.test(paper.published) 
                    ? paper.published 
                    : new Date(paper.published).toLocaleDateString())
                : 'Unknown date'}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-3 mb-4">
            {paper.abstract || 'No abstract available'}
          </p>
        </div>
        
        <div className="mt-auto">
          <div className="text-sm text-slate-600">
            <p className="font-semibold mb-1">Authors:</p>
            <p className="line-clamp-1 italic">
              {paper.authors.join(', ')}
            </p>
          </div>
        </div>

        {paper.externalIds && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap gap-3">
              {paper.externalIds.ArXiv && (
                <a
                  href={`https://arxiv.org/pdf/${paper.externalIds.ArXiv}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1"
                  title="Download from arXiv"
                >
                  <FileText className="w-3 h-3" />
                  <span>arXiv [{paper.externalIds.ArXiv}]</span>
                </a>
              )}
              {paper.externalIds.ACL && (
                <a
                  href={`https://aclanthology.org/${paper.externalIds.ACL}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                  title="Download from ACL Anthology"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>ACL [{paper.externalIds.ACL}]</span>
                </a>
              )}
              {paper.externalIds.PubMedCentral && (
                <a
                  href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${paper.externalIds.PubMedCentral}/pdf/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-green-600 transition-colors flex items-center gap-1"
                  title="Download from PubMed Central"
                >
                  <Database className="w-3 h-3" />
                  <span>PMC [{paper.externalIds.PubMedCentral}]</span>
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tag Editor Modal */}
      {showTagEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="glass-card p-6 rounded-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Add Tags to Paper</h3>
              <button 
                onClick={() => setShowTagEditor(false)} 
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Paper preview */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-800 text-sm mb-2">{paper.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">
                {paper.abstract || 'No abstract available'}
              </p>
              {!isSaved && (
                <p className="text-xs text-orange-600 mt-2">
                  This paper will be added to your liked papers when you submit tags.
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap mb-3">
                {pendingTags.map(tag => (
                  <span key={tag} className="bg-pink-400 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    {tag}
                    <button 
                      onClick={() => handleRemovePendingTag(tag)}
                      className="ml-2 text-white hover:text-pink-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a new tag"
                  className="flex-1 glass-input p-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPendingTag(newTag)}
                />
                <button 
                  onClick={() => handleAddPendingTag(newTag)}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
            
            {loadingUserTags ? (
              <div className="mb-6">
                <p className="text-sm text-slate-600">Loading your tags...</p>
              </div>
            ) : userTags.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Your Existing Tags:</h4>
                <div className="flex gap-2 flex-wrap">
                  {userTags.filter(tag => !pendingTags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleAddPendingTag(tag)}
                      className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm hover:bg-slate-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 mb-6">You don't have any existing tags yet.</p>
            )}

            <div className="flex justify-end">
              <button 
                onClick={handleSubmitTags}
                disabled={isSavingForTagging}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isSavingForTagging ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfNotification && pdfInfo && (
        <PdfNotification
          paperTitle={paper.title}
          pdfUrl={pdfInfo.url}
          sourceName={pdfInfo.source}
          onOpen={handleOpenPdf}
          onDismiss={handleDismissNotification}
          onChat={handleChatWithAI}
          onRecommend={handleRecommendations}
        />
      )}

      <AIChat
        paper={paper}
        pdfInfo={resolvedPdfInfo}
        onClose={() => setShowChat(false)}
        isOpen={showChat}
      />

      <Recommendations
        paper={paper}
        onClose={() => setShowRecommendations(false)}
        onSavePaper={savePaper}
        savedPaperIds={savedPaperIds}
        isOpen={showRecommendations}
      />
    </>
  );
};

export default PaperCard;