import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PaperCard from '../components/PaperCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Paper } from '../types/paper';
import toast from 'react-hot-toast';

export default function LikedPapersPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLikedPapers = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('saved_papers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedPapers: Paper[] = data.map(item => ({
          id: item.paper_id,
          title: item.title,
          abstract: item.abstract,
          authors: item.authors,
          published: item.published || '',
          url: item.url,
          pdfUrl: item.source === 'arxiv' ? item.url.replace('abs', 'pdf') : null,
          fieldsOfStudy: item.fieldsOfStudy || [],
          citationCount: item.citationCount || 0,
          publicationTypes: item.publicationTypes || [],
          venue: item.venue || '',
        }));

        setPapers(formattedPapers);
      } catch (error) {
        console.error('Error fetching liked papers:', error);
        toast.error('Failed to load liked papers');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPapers();
  }, [user]);

  const handlePaperRemoved = (paperId: string) => {
    setPapers(prev => prev.filter(p => p.id !== paperId));
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              Your Liked Papers
            </h1>
            <p className="text-slate-600">
              All papers you've saved to your collection
            </p>
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
                  key={`liked-${i}`} 
                  paper={paper} 
                  onRemove={handlePaperRemoved}
                  showHeartAsSaved
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}