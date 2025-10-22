import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Edit, Calendar, Target, BarChart3, ChevronDown, ChevronUp, Trash2, Copy, User as UserIcon } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Paper {
  id: string;
  urn: string;
  title: string;
  topic_tags: string[];
  abstract: string;
  motive: string;
  completion_percentage: number;
  template: string;
  collaborators_needed: number;
  author_id: string;
  is_public: boolean;
  collaborators: string[];
  created_at: string;
  updated_at: string;
}

interface AuthorInfo {
  id: string;
  name: string;
}

export default function MyPapersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [paperAuthors, setPaperAuthors] = useState<Record<string, AuthorInfo[]>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPapers();
    }
  }, [user]);

  const getCardStyle = (paper: Paper) => ({
    background: 'linear-gradient(145deg, #ffffff, #f0f4ff)',
    backdropFilter: 'blur(14px)',
    border: isAuthor(paper)
      ? '1px solid rgba(99, 102, 241, 0.3)'
      : '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
    borderRadius: '1rem',
    position: 'relative',
    overflow: 'hidden',
  });

  const fetchPapers = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .or(`author_id.eq.${user.id},collaborators.cs.{${user.id}}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPapers(data || []);
      
      if (data && data.length > 0) {
        fetchAuthors(data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch papers');
    }
    setLoading(false);
  };

  const fetchAuthors = async (papersList: Paper[]) => {
    try {
      const userIds = new Set<string>();
      papersList.forEach(paper => {const fetchAuthors = async (papersList: Paper[]) => {
    try {
      const userIds = new Set<string>();
      papersList.forEach(paper => {
        userIds.add(paper.author_id);
        paper.collaborators?.forEach(collabId => userIds.add(collabId));
      });

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', Array.from(userIds));
      
      if (error) throw error;

      const profileMap = new Map<string, string>();
      profiles.forEach(profile => {
        profileMap.set(profile.user_id, profile.username);
      });
      
      const authorsMap: Record<string, AuthorInfo[]> = {};
      
      papersList.forEach(paper => {
        const authors = [];
        
        const authorName = profileMap.get(paper.author_id) || 
                          (paper.author_id === user?.id ? 'You' : 'Unknown');
        authors.push({ id: paper.author_id, name: authorName });
        
        paper.collaborators?.forEach(collabId => {
          if (collabId !== paper.author_id) {
            const collabName = profileMap.get(collabId) || 
                              (collabId === user?.id ? 'You' : 'Unknown');
            authors.push({ id: collabId, name: collabName });
          }
        });
        
        authorsMap[paper.id] = authors;
      });
      
      setPaperAuthors(authorsMap);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to load author information');
    }
  };
        userIds.add(paper.author_id);
        paper.collaborators?.forEach(collabId => userIds.add(collabId));
      });

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', Array.from(userIds));
      
      if (error) throw error;

      const profileMap = new Map(profiles.map(p => [p.user_id, p.username]));
      
      const authorsMap: Record<string, AuthorInfo[]> = {};
      
      papersList.forEach(paper => {
        const authors = [];
        
        const authorName = profileMap.get(paper.author_id) || 'Unknown';
        authors.push({ id: paper.author_id, name: authorName });
        
        paper.collaborators?.forEach(collabId => {
          if (collabId !== paper.author_id) { 
            const collabName = profileMap.get(collabId) || 'Unknown';
            authors.push({ id: collabId, name: collabName });
          }
        });
        
        authorsMap[paper.id] = authors;
      });
      
      setPaperAuthors(authorsMap);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const toggleExpanded = (paperId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(paperId)) {
      newExpanded.delete(paperId);
    } else {
      newExpanded.add(paperId);
    }
    setExpandedCards(newExpanded);
  };

  const handleDeletePaper = async (paperId: string) => {
    try {
      const { error } = await supabase.from('papers').delete().eq('id', paperId);
      if (error) throw error;
      setPapers(papers.filter(p => p.id !== paperId));
      setShowDeleteConfirm(null);
      toast.success('Paper deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete paper');
    }
  };

  const handleToggleVisibility = async (paperId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('papers')
        .update({ is_public: isPublic })
        .eq('id', paperId);
  
      if (error) throw error;
  
      setPapers(papers.map(p =>
        p.id === paperId ? { ...p, is_public: isPublic } : p
      ));
  
      toast.success(`Paper is now ${isPublic ? 'public' : 'private'}`);
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };
  

  const isAuthor = (paper: Paper) => paper.author_id === user?.id;

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const copyToClipboard = async (urn: string) => {
    try {
      await navigator.clipboard.writeText(urn);
      toast.success('URN copied to clipboard!');
    } catch {
      toast.error('Failed to copy URN');
    }
  };

  return (
    <div className="min-h-screen">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="glass-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">My Papers</h1>
                <p className="text-slate-600">Manage your research projects and collaborations</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                First Author
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Collaborator
              </span>
            </div>
          </div>

          {/* Papers List */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="glass-card p-8 skeleton"></div>
              ))}
            </div>
          ) : papers.length > 0 ? (
            <div className="space-y-6">
              {papers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] flex flex-col"
                  style={getCardStyle(paper)}
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                          isAuthor(paper)
                            ? 'bg-green-100 text-green-800 border border-green-500'
                            : 'bg-red-100 text-red-800 border border-red-500'
                        }`}
                      >
                        {isAuthor(paper) ? 'First Author' : 'Collaborator'}
                      </span>

                      {isAuthor(paper) && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500"></span>
                        
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(paper.id, !paper.is_public);
                            }}
                            className={`relative rounded-full w-12 h-6 overflow-hidden transition-colors duration-300 focus:outline-none ${
                              paper.is_public ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            <motion.span
                              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                              initial={false}
                              animate={{ x: paper.is_public ? 24 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          </button>
                        
                          <span
                            className={`text-xs font-medium ${
                              paper.is_public ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {paper.is_public ? 'Public' : 'Private'}
                          </span>
                        </div>
                      )}

                      
                      {/* Show URN only for authors */}
                      {isAuthor(paper) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(paper.urn);
                          }}
                          className="bg-white shadow-sm hover:shadow-md transition px-3 py-1 rounded-lg border border-cyan-4  00 text-cyan-600 font-mono font-bold"
                        >
                          <Copy className="w-4 h-4 inline mr-1" /> {paper.urn}
                        </button>
                      )}
                      
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm ${getCompletionColor(
                          paper.completion_percentage
                        )}`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="font-bold">{paper.completion_percentage}%</span>
                      </div>
                    </div>
                    
                    {/* Show edit/delete buttons only for authors */}
                    {isAuthor(paper) && (
                      <div className="flex gap-2">
                        <Link
                          to={`/edit-paper/${paper.id}`}
                          className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-teal-500 hover:to-blue-500 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-md"
                        >
                          <Edit className="w-3 h-3" /> EDIT CARD
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(paper.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 py-1 px-3 rounded-lg text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-800 text-xl flex-1 mr-4">{paper.title}</h3>
                      <div className="text-right text-sm text-slate-500 flex-shrink-0">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(paper.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-wrap gap-2">
                        {paper.topic_tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-teal-800 rounded-lg text-xs font-medium shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-600 font-medium uppercase bg-slate-100 px-2 py-1 rounded-lg shadow-sm">
                        {paper.template}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-md font-semibold text-slate-700">Abstract</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {expandedCards.has(paper.id) ? paper.abstract : truncateText(paper.abstract)}
                          {paper.abstract.length > 150 && (
                            <button
                              onClick={() => toggleExpanded(paper.id)}
                              className="text-indigo-600 hover:text-indigo-700 ml-2 font-medium inline-flex items-center gap-1 text-sm"
                            >
                              {expandedCards.has(paper.id) ? (
                                <>
                                  Show less <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-slate-500" />
                          <span className="text-md font-semibold text-slate-700">Motive</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {expandedCards.has(paper.id) ? paper.motive : truncateText(paper.motive)}
                          {paper.motive.length > 150 && (
                            <button
                              onClick={() => toggleExpanded(paper.id)}
                              className="text-indigo-600 hover:text-indigo-700 ml-2 font-medium inline-flex items-center gap-1 text-sm"
                            >
                              {expandedCards.has(paper.id) ? (
                                <>
                                  Show less <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Authors & Edit Paper Button in One Row */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {paperAuthors[paper.id]?.map((author, idx) => (
                        <div 
                          key={author.id} 
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                            idx === 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <UserIcon className="w-3 h-3" />
                          {author.name}
                          {idx === 0 && <span className="ml-1">(Author)</span>}
                        </div>
                      ))}
                    </div>
                  
                    <Link
                      to={`/paper/${paper.id}`}
                      className="bg-gradient-to-r from-red-500 to-purple-700 hover:from-red-600 hover:to-purple-800 
                                text-white px-5 py-2 rounded-xl shadow-lg shadow-green-200 
                                font-semibold tracking-wide inline-flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Go to Paper
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Papers Yet</h3>
                <p className="text-slate-600 mb-6">
                  Start your research journey by creating your first paper or collaborating with others.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => (window.location.href = '/first-author')}
                    className="glass-button px-4 py-2"
                  >
                    Create Paper
                  </button>
                  <button
                    onClick={() => (window.location.href = '/collaborator')}
                    className="glass-card px-4 py-2 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Join Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 max-w-md mx-4"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Delete Paper</h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this paper? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="glass-card px-4 py-2 text-slate-700 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePaper(showDeleteConfirm)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}