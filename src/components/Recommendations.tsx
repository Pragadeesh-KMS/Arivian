import React, { useState, useEffect } from 'react';
import { X, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Paper } from '../types/paper';
import { getPaperRecommendations } from '../services/ss';
import toast from 'react-hot-toast';

interface RecommendationsProps {
  paper: Paper;
  onClose: () => void;
  onSavePaper: (paperData: any) => Promise<boolean>;
  savedPaperIds: Set<string>;
  isOpen: boolean;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  paper,
  onClose,
  onSavePaper,
  savedPaperIds,
  isOpen
}) => {
  const [recommendations, setRecommendations] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorLink, setErrorLink] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setErrorLink('');
    
    try {
      const source = paper.source || (paper.id.startsWith('arXiv:') ? 'arxiv' : 'semantic-scholar');
      const result = await getPaperRecommendations(paper.id, source, 15);
      setRecommendations(result.papers);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      let actualUrl = '';
      if (error.message.includes('(URL: ')) {
        actualUrl = error.message.split('(URL: ')[1].slice(0, -1);
      }
      
      setErrorLink(actualUrl);
      toast.error(
        <div>
          <p>No recommendations found</p>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
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
      await onSavePaper(paperData);
    } catch (error) {
      console.error('Error saving recommended paper:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-70">
      <div className="flex justify-between items-center p-4 bg-slate-800 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Recommended Papers</h2>
          {loading && (
            <div className="text-sm text-gray-300 ml-2">Loading...</div>
          )}
        </div>
        <button
          onClick={onClose}
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
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;