import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Users, Search, CheckCircle, Loader, FileText, BarChart3, Calendar, ChevronRight, Mail } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
  urn: yup.string()
    .length(12, 'URN must be exactly 12 characters')
    .required('URN is required'),
});

type FormData = yup.InferType<typeof schema>;

interface PaperSearchResultProps {
  paper: any;
  onJoin: (urn: string) => void;
}

function PaperSearchResult({ paper, onJoin }: PaperSearchResultProps) {
  const [expanded, setExpanded] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const { profile: currentUserProfile } = useAuth();
  
  const handleContactAuthor = async () => {
    setContactLoading(true);
    try {
      const { data: authorProfile, error } = await supabase
        .from('profiles')
        .select('email, username')
        .eq('user_id', paper.author_id)
        .single();

      if (error || !authorProfile) {
        throw error || new Error('Author profile not found');
      }
      const userUuid = currentUserProfile?.user_id || 'UUID not available';


      const subject = `Interest in Research Project: ${paper.title}`;
      const body = `Hello,\n\nI am ${currentUserProfile?.username || 'a researcher'}. This is my UUID: ${userUuid}. I would like to join your research project "${paper.title}".\n\nHere is my resume attached with this mail for your reference. Waiting for your reply.\n\nRegards,\n${currentUserProfile?.username || 'Your Name'}`;
      
      window.location.href = `mailto:${authorProfile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (error) {
      toast.error('Failed to fetch author details');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-xl mb-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 mb-2">{paper.title}</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {paper.topic_tags?.map((tag: string, index: number) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{(paper.collaborators?.length || 0)}/{paper.collaborators_needed} collabs</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>{paper.completion_percentage}% complete</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(paper.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              {expanded ? 'Hide Abstract' : 'Show Abstract'} 
              <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          {expanded && (
            <div className="bg-slate-50/50 p-4 rounded-lg text-sm text-slate-600 border border-slate-200">
              <p>{paper.abstract || 'No abstract available'}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={() => onJoin(paper.urn)}
            className="glass-button px-4 py-2 whitespace-nowrap"
          >
            Join Project
          </button>
          
          <button
            onClick={handleContactAuthor}
            disabled={contactLoading}
            className="flex items-center justify-center gap-2 glass-button bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 whitespace-nowrap disabled:opacity-50"
          >
            {contactLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Contact Author
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CollaboratorPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paperDetails, setPaperDetails] = useState<any>(null);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'urn' | 'search'>('urn');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const createCollaboratorPaperCard = () => {
    if (!paperDetails) return;
    navigate('/my-papers');
    toast.success('Collaborator paper card created!', {
      icon: '✅',
      duration: 3000
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%,motive.ilike.%${searchQuery}%,topic_tags.cs.{${searchQuery}}`)
        .eq('is_public', true)
        .limit(10);

      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    }
    setSearchLoading(false);
  };

  const joinByUrn = async (urn: string) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const { data: paper, error: fetchError } = await supabase
        .from('papers')
        .select('*')
        .eq('urn', urn)
        .single();

      if (fetchError || !paper) {
        toast.error('Invalid URN or paper not found');
        setLoading(false);
        return;
      }

      const authorized = paper.collaborators_authorized || [];
      
      if (authorized.length > 0 && !authorized.includes(user.id)) {
        toast.error(
          `You are not authorized to join this project. 
          Your UUID: ${user.id}
          Contact the paper author and provide this UUID.`,
          { duration: 10000 }
        );
        setLoading(false);
        return;
      }
  
      if (authorized.length === 0) {
        toast.error(
          'No collaborators are authorized for this project yet. ' + 
          'Contact the paper author to add your UUID.'
        );
        setLoading(false);
        return;
      }
  
      const currentCollaborators = paper.collaborators || [];
      if (currentCollaborators.includes(user.id)) {
        toast.error('You are already a collaborator on this paper');
        setLoading(false);
        return;
      }
  
      if (paper.author_id === user.id) {
        toast.error('You cannot collaborate on your own paper');
        setLoading(false);
        return;
      }
  
      if (currentCollaborators.length >= paper.collaborators_needed) {
        toast.error('This paper already has the maximum number of collaborators');
        setLoading(false);
        return;
      }
  
      const updatedCollaborators = [...currentCollaborators, user.id];
      const { error: updateError } = await supabase
        .from('papers')
        .update({
          collaborators: updatedCollaborators,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paper.id);
  
      if (updateError) throw updateError;
  
      setPaperDetails(paper);
      setSuccess(true);
      toast.success('Successfully joined the research project!');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join project');
    }
    setLoading(false);
  };

  const onSubmit = async (data: FormData) => {
    await joinByUrn(data.urn);
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
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8 mb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Join as Collaborator</h1>
              <p className="text-slate-600">Enter the URN provided by the First Author to join their research project</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('urn')}
                className={`flex-1 py-3 font-medium ${
                  activeTab === 'urn'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Join with URN
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 font-medium ${
                  activeTab === 'search'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Search Projects
              </button>
            </div>

            {!success ? (
              activeTab === 'urn' ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">Research Paper URN *</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        {...register('urn')}
                        type="text"
                        className="glass-input pl-12 w-full text-center font-mono text-lg tracking-wider"
                        placeholder="Enter 12-digit URN"
                        maxLength={12}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    {errors.urn && (
                      <p className="form-error">{errors.urn.message}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      The URN is a 12-character unique identifier provided by the First Author
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="glass-button px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Joining Project...
                        </div>
                      ) : (
                        'Join Research Project'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">Search Research Papers</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="glass-input pl-12 w-full"
                        placeholder="Search by title, topics, abstract, motive..."
                      />
                      <button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-4 rounded-lg transition-colors"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">Successfully Joined!</h2>
                  <p className="text-green-600 mb-6">You are now a collaborator on this research project</p>
                </div>

                {paperDetails && (
                  <div className="glass-card p-6 bg-green-50/30 border-green-200/50 text-left">
                    <h3 className="font-semibold text-green-800 mb-3">Project Details:</h3>
                    <div className="space-y-2 text-sm text-green-700">
                      <p><strong>Title:</strong> {paperDetails.title}</p>
                      <p><strong>URN:</strong> {paperDetails.urn}</p>
                      {paperDetails.topic_tags && (
                        <p><strong>Topics:</strong> {paperDetails.topic_tags.join(', ')}</p>
                      )}
                      <p><strong>Completion:</strong> {paperDetails.completion_percentage}%</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={createCollaboratorPaperCard}
                  className="glass-button px-6 py-3 text-lg"
                >
                  Create Collaborator Paper Card
                </button>
              </motion.div>
            )}
          </div>

          {/* Search Results Section - Outside the main card */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-indigo-600" />
                Search Results
              </h2>
              
              {searchLoading && (
                <div className="glass-card p-8 flex flex-col items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                  <p className="text-slate-600">Searching for projects...</p>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {searchResults.map((paper) => (
                    <PaperSearchResult 
                      key={paper.id} 
                      paper={paper} 
                      onJoin={joinByUrn} 
                    />
                  ))}
                </motion.div>
              )}

              {!searchLoading && searchQuery && searchResults.length === 0 && (
                <div className="glass-card p-8 text-center">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No Projects Found</h3>
                  <p className="text-slate-600">
                    No papers match your search for "{searchQuery}". Try different keywords.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}