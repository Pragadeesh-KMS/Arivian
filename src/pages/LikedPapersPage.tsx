import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader, Filter, X, Tag, Trash2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PaperCard from '../components/PaperCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Paper } from '../types/paper';
import toast from 'react-hot-toast';

export default function LikedPapersPage() {
  const { user, getUserTags, updatePaperTags } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [deletingTag, setDeletingTag] = useState(false);
  const hasFetchedInitialData = useRef(false);

  useEffect(() => {
    fetchAvailableTags();
  }, [user]);

  useEffect(() => {
    if (user && !hasFetchedInitialData.current) {
      fetchLikedPapers();
      hasFetchedInitialData.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (user && hasFetchedInitialData.current) {
      fetchLikedPapers();
    }
  }, [selectedTag]);

  const handleTagsUpdated = () => {
    fetchAvailableTags();
    fetchLikedPapers();
  };

  const fetchAvailableTags = async () => {
    if (!user) return;
    
    const tags = await getUserTags();
    setAvailableTags(tags);
  };

  const fetchLikedPapers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('saved_papers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPapers: Paper[] = data.map(item => ({
        id: item.paper_id,
        title: item.title,
        abstract: item.abstract,
        authors: item.authors,
        published: item.published || item.created_at?.split('T')[0] || '',
        url: item.url,
        pdfUrl: item.source === 'arxiv' ? item.url.replace('abs', 'pdf') : null,
        fieldsOfStudy: item.fieldsOfStudy || [],
        citationCount: item.citationCount || 0,
        influentialCitationCount: item.influentialCitationCount || 0,
        publicationTypes: item.publicationTypes || [],
        venue: item.venue || '',
        externalIds: item.external_ids || null,
        tags: item.tags || [],
        source: item.source,
      }));

      setPapers(formattedPapers);
    } catch (error) {
      console.error('Error fetching liked papers:', error);
      toast.error('Failed to load liked papers');
    } finally {
      setLoading(false);
    }
  };

  const handlePaperRemoved = (paperId: string) => {
    setPapers(prev => prev.filter(p => p.id !== paperId));
    fetchLikedPapers();
  };

  const handleDeleteTag = async (tag: string) => {
    if (!user) return;
    
    setDeletingTag(true);
    try {
      const { data: papersWithTag } = await supabase
        .from('saved_papers')
        .select('paper_id, tags')
        .eq('user_id', user.id)
        .contains('tags', [tag]);
      
      if (papersWithTag) {
        for (const paperData of papersWithTag) {
          const updatedTags = paperData.tags.filter((t: string) => t !== tag);
          await updatePaperTags(paperData.paper_id, updatedTags);
        }
        
        toast.success(`Removed tag "${tag}" from all papers`);
        fetchAvailableTags();
        fetchLikedPapers();
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    } finally {
      setDeletingTag(false);
      setTagToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 md:px-6 pb-12 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <div className="glass-card p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Heart className="w-8 h-8 text-red-500" />
                  Your Liked Papers
                </h1>
                <p className="text-slate-600">
                  All papers you've saved to your collection
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {availableTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-500" />
                    <select
                      value={selectedTag || ''}
                      onChange={(e) => setSelectedTag(e.target.value || null)}
                      className="glass-input p-2 rounded-lg"
                    >
                      <option value="">All Tags</option>
                      {availableTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    {selectedTag && (
                      <button 
                        onClick={() => setSelectedTag(null)}
                        className="p-2 text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setShowTagManager(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Tag className="w-5 h-5" />
                  Manage Tags
                </button>
              </div>
            </div>
            
            {selectedTag && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Filtered by tag:</span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm">
                  {selectedTag}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="glass-card p-8 text-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-slate-600">Loading your liked papers...</p>
              </div>
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Liked Papers Yet
                </h3>
                <p className="text-slate-600">
                  Start liking papers to see them here!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {papers.map((paper, i) => (
                <PaperCard 
                  key={paper.id} 
                  paper={paper} 
                  onRemove={handlePaperRemoved}
                  onTagsUpdated={handleTagsUpdated}
                  showHeartAsSaved
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Tag Manager Modal */}
      <AnimatePresence>
        {showTagManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-8 h-8 text-indigo-600" />
                  Manage Your Tags
                </h2>
                <button 
                  onClick={() => setShowTagManager(false)} 
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {availableTags.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No Tags Yet
                  </h3>
                  <p className="text-slate-600">
                    Add tags to your papers to see them here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTags.map(tag => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative group bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-purple-800 text-lg">
                          {tag}
                        </span>
                        <button
                          onClick={() => setTagToDelete(tag)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete this tag"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setTagToDelete(tag)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete Tag
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tagToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 rounded-xl max-w-md w-full"
            >
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Delete Tag
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to delete the tag "<span className="font-semibold">{tagToDelete}</span>"?
                  This will remove it from all papers.
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setTagToDelete(null)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  disabled={deletingTag}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTag(tagToDelete)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  disabled={deletingTag}
                >
                  {deletingTag ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}