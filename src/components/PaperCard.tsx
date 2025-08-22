import React, { useState, useEffect } from 'react';
import { Heart, ExternalLink, Sparkles, X, Tag, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getPaperRecommendations } from '../services/ss';
import { Paper } from '../types/paper';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface PaperCardProps {
  paper: Paper;
  onRemove?: (paperId: string) => void;
  showHeartAsSaved?: boolean;
  showBookAsSaved?: boolean;
}

const PaperCard = ({ 
  paper, 
  onRemove,
  showBookAsSaved = false
}: PaperCardProps) => {
  const { 
    user, 
    savePaper, 
    savedPaperIds, 
    updatePaperTags,
    getUserTags
  } = useAuth();

  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Paper[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [errorLink, setErrorLink] = useState<string>('');
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [paperTags, setPaperTags] = useState<string[]>(paper.tags || []);
  const [newTag, setNewTag] = useState('');
  const [userTags, setUserTags] = useState<string[]>([]);
  const [isSavingForTagging, setIsSavingForTagging] = useState(false);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [loadingUserTags, setLoadingUserTags] = useState(false);
  
  const isSaved = savedPaperIds.has(paper.id);
  const source = paper.source || (paper.id.startsWith('arXiv:') ? 'arxiv' : 'semantic-scholar');

  useEffect(() => {
    if (isSaved && user) {
      fetchPaperTags();
    }
  }, [isSaved, user]);

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
      url: paper.url,
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
    if (pendingTags.length === 0) {
      toast.error('Please add at least one tag or choose from existing ones');
      return;
    }
    
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
        toast.success('Paper tagged successfully!');
        
        fetchUserTags();
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

  const handleRecommendations = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingRecommendations(true);
    setErrorLink('');
    
    try {
      let formattedId = paper.id;
      if (source === 'arxiv' && !paper.id.startsWith('arXiv:')) {
        formattedId = `arXiv:${paper.id}`;
      } else if (source === 'semantic-scholar' && paper.id.startsWith('arXiv:')) {
        formattedId = paper.id.replace('arXiv:', '');
      }
      
      const recs = await getPaperRecommendations(formattedId, source, 15);
      setRecommendations(recs);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const apiLink = `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${source === 'arxiv' ? `arXiv:${paper.id}` : paper.id}?fields=title,url,authors,venue,year&limit=5`;
      setErrorLink(apiLink);
      toast.error(
        <div>
          <p>Failed to load recommendations</p>
          <p className="text-xs mt-1">This is the failed request link:</p>
          <p className="text-xs mt-1 break-all">{apiLink}</p>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const closeRecommendations = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRecommendations(false);
    setRecommendations([]);
    setErrorLink('');
  };

  const handleSaveRecommendedPaper = async (e: React.MouseEvent, recPaper: Paper) => {
    e.stopPropagation();
    
    const recSource = recPaper.source || (recPaper.id.startsWith('arXiv:') ? 'arxiv' : 'semantic-scholar');
    const paperData = {
      paper_id: recPaper.id,
      title: recPaper.title,
      abstract: recPaper.abstract,
      authors: recPaper.authors,
      url: recPaper.url,
      source: recSource
    };
    
    try {
      await savePaper(paperData);
      toast.success('Paper saved to your collection');
    } catch (error) {
      console.error('Error saving recommended paper:', error);
      toast.error('Failed to save paper');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 rounded-xl cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col relative"
        onClick={() => window.open(paper.url, '_blank')}
      >
        {/* Tags display - positioned half in and half out */}
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
            <button 
              onClick={handleRecommendations}
              disabled={loadingRecommendations}
              className="p-1 text-indigo-500 hover:bg-indigo-100 rounded-full transition-colors"
              title="Get recommendations"
            >
              <Sparkles className={`w-4 h-4 ${loadingRecommendations ? 'animate-pulse' : ''}`} />
            </button>
            {/* Always show tag button */}
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
          <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
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
            ) : (
              <span className="font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
                Preprint
              </span>
            )}
            <span>
              {paper.published ? new Date(paper.published).toLocaleDateString() : 'Unknown date'}
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
                disabled={isSavingForTagging || pendingTags.length === 0}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isSavingForTagging ? 'Saving...' : 'Submit Tags'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Overlay */}
      <AnimatePresence>
        {showRecommendations && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-70">
            <div className="flex justify-between items-center p-4 bg-slate-800 text-white">
              <h2 className="text-xl font-semibold">Recommended Papers</h2>
              <button
                onClick={closeRecommendations}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 p-6 overflow-y-auto">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-card p-5 rounded-xl shadow-xl h-fit"
                >
                  <h3 className="font-bold text-slate-800 text-lg mb-4">
                    {paper.title}
                  </h3>
                  
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
                  
                  <p className="text-sm text-slate-600 mb-4">
                    {paper.abstract || 'No abstract available'}
                  </p>
                  
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold mb-1">Authors:</p>
                    <p className="italic">
                      {paper.authors.join(', ')}
                    </p>
                  </div>
                </motion.div>
              </div>
              
              {/* Recommendations list */}
              <div className="w-2/3 p-6 bg-white overflow-y-auto">
                <div className="space-y-4">
                  {recommendations.map((recPaper, index) => {
                    const isRecSaved = savedPaperIds.has(recPaper.id);
                    
                    return (
                      <motion.div
                        key={recPaper.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-4 rounded-xl cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
                        onClick={() => window.open(recPaper.url, '_blank')}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 text-base mb-2">
                              {recPaper.title}
                            </h4>
                            
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                              <span>
                                {recPaper.citationCount > 0 
                                  ? `${recPaper.citationCount} citations`
                                  : recPaper.venue || recPaper.publicationTypes?.[0] || 'Preprint'
                                }
                              </span>
                              <span>{recPaper.published ? new Date(recPaper.published).getFullYear() : ''}</span>
                            </div>
                            
                            <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                              {recPaper.abstract || 'No abstract available'}
                            </p>
                          </div>
                          
                          <button 
                            onClick={(e) => handleSaveRecommendedPaper(e, recPaper)}
                            className="ml-4 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            title={isRecSaved ? "Remove from Saved" : "Save to My Interests"}
                          >
                            <Heart className={`w-4 h-4 ${isRecSaved ? 'fill-red-500' : ''}`} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {errorLink && (
                  <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 font-medium">Failed to load recommendations</p>
                    <p className="text-red-600 text-sm mt-1">This is the failed request link:</p>
                    <a 
                      href={errorLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-500 text-xs underline break-all"
                    >
                      {errorLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PaperCard;