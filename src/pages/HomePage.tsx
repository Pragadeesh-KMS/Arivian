import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, BookOpen, ExternalLink, Loader, X, ArrowLeft, ArrowRight, Clock, 
  Calendar, Heart, TrendingUp 
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PaperCard from '../components/PaperCard'; 
import { useAuth } from '../contexts/AuthContext';
import { searchRelevantPapers, searchBulkPapers } from '../services/ss';
import { searchArXivPapers, ArXivPaper, getRecentDaysPapers } from '../services/arxivApi';
import { Paper } from '../types/paper';
import toast from 'react-hot-toast';

const convertArXivToPaper = (arxivPaper: ArXivPaper): Paper => ({
  id: arxivPaper.id,
  title: arxivPaper.title,
  authors: arxivPaper.authors,
  abstract: arxivPaper.abstract,
  published: arxivPaper.published,
  url: arxivPaper.url,
  pdfUrl: arxivPaper.pdfUrl,
  fieldsOfStudy: arxivPaper.categories,
  influentialCitationCount: 0,
  citationCount: 0,
  publicationTypes: ['preprint'],
  venue: 'arXiv',
  source: 'arxiv',
});

export default function HomePage() {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<'trending' | 'recent' | 'topics' | 'search'>('trending');
  const [searchTerm, setSearchTerm] = useState('');
  const [papers, setPapers] = useState<Record<string, Paper[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [trendingPapers, setTrendingPapers] = useState<Record<string, Paper[]>>({});
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [isArXivMode, setIsArXivMode] = useState(false);

  const getTopics = useCallback(() => {
    if (!profile) return [];
    return [
      profile.topic1,
      profile.topic2,
      profile.topic3,
      profile.topic4,
      profile.topic5
    ].filter(topic => topic && topic.trim() !== '');
  }, [profile]);

  const fetchTrendingPapers = useCallback(async () => {
    const topics = getTopics();
    if (topics.length === 0) return;
    
    setTrendingLoading(true);
    const papersPerTopic: Record<string, Paper[]> = {};
    
    for (const topic of topics) {
      try {
        const arxivPapers = await getRecentDaysPapers(topic, 12);
        papersPerTopic[topic] = arxivPapers.map(convertArXivToPaper);
      } catch (error) {
        console.error(`Failed to fetch trending papers for topic: ${topic}`, error);
        papersPerTopic[topic] = [];
        toast.error(`Failed to load trending papers for: ${topic}`);
      }
    }
    
    setTrendingPapers(papersPerTopic);
    setTrendingLoading(false);
  }, [getTopics]);

  const fetchRecentPapers = useCallback(async () => {
    const topics = getTopics();
    if (topics.length === 0) return;

    setLoading(prev => ({ ...prev, recent: true }));
    const papersPerTopic: Record<string, Paper[]> = {};

    for (const topic of topics) {
      try {
        const cacheKey = `recent:ss:${topic}:${yearFilter || '2014-'}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          papersPerTopic[topic] = JSON.parse(cached);
        } else {
          const ssPapers = await searchRelevantPapers(topic, 15, yearFilter || '2014-');
          papersPerTopic[topic] = ssPapers;
          try { sessionStorage.setItem(cacheKey, JSON.stringify(ssPapers)); } catch {}
        }
      } catch (ssError) {
        console.warn(`Semantic Scholar failed for topic "${topic}", trying ArXiv...`);
        try {
          const arxivPapers = await searchArXivPapers(topic, 15, yearFilter || '2014-');
          papersPerTopic[topic] = arxivPapers.map(convertArXivToPaper);
        } catch (arxivError) {
          console.error(`Both APIs failed for topic: ${topic}`, { ssError, arxivError });
          papersPerTopic[topic] = [];
          toast.error(`Failed to load recent papers for: ${topic}`);
        }
      }
    }

    setPapers(papersPerTopic);
    setLoading(prev => ({ ...prev, recent: false }));
  }, [getTopics, yearFilter]);

  const fetchBestPapers = useCallback(async () => {
    const topics = getTopics();
    if (topics.length === 0) return;

    setLoading(prev => ({ ...prev, topics: true }));
    const papersPerTopic: Record<string, Paper[]> = {};

    for (const topic of topics) {
      try {
        const cacheKey = `best:ss:${topic}:${yearFilter || '2014-'}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          papersPerTopic[topic] = JSON.parse(cached);
        } else {
          const ssPapers = await searchBulkPapers(topic, 15, yearFilter || '2014-');
          papersPerTopic[topic] = ssPapers;
          try { sessionStorage.setItem(cacheKey, JSON.stringify(ssPapers)); } catch {}
        }
      } catch (ssError) {
        console.warn(`Semantic Scholar failed for topic "${topic}", trying ArXiv...`);
        try {
          const arxivPapers = await searchArXivPapers(topic, 15, yearFilter || '2014-');
          papersPerTopic[topic] = arxivPapers.map(convertArXivToPaper);
        } catch (arxivError) {
          console.error(`Both APIs failed for topic: ${topic}`, { ssError, arxivError });
          papersPerTopic[topic] = [];
          toast.error(`Failed to load best papers for: ${topic}`);
        }
      }
    }

    setPapers(papersPerTopic);
    setLoading(prev => ({ ...prev, topics: false }));
  }, [getTopics, yearFilter]);

  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) return;
  
    setLoading(prev => ({ ...prev, search: true }));
    setPapers({});
  
    try {
      if (isArXivMode) {
        let processedQuery = query;
        if (query.includes('arxiv.org/abs/')) {
          processedQuery = query.split('arxiv.org/abs/')[1];
        }
        if (query.includes('doi.org/')) {
          processedQuery = query.split('doi.org/')[1];
        }
        processedQuery = processedQuery.replace(/v\d+$/i, '');
        
        const arxivPapers = await searchArXivPapers(processedQuery, 20, yearFilter || '2014-');
        setPapers({ [query]: arxivPapers.map(convertArXivToPaper) });
      } else {
        const ssPapers = await searchRelevantPapers(query, 20, yearFilter || '2014-');
        setPapers({ [query]: ssPapers });
      }
    } catch (error) {
      console.error('Search failed:', error);
      try {
        if (isArXivMode) {
          const ssPapers = await searchRelevantPapers(query, 20, yearFilter || '2014-');
          setPapers({ [query]: ssPapers });
        } else {
          const arxivPapers = await searchArXivPapers(query, 20, yearFilter || '2014-');
          setPapers({ [query]: arxivPapers.map(convertArXivToPaper) });
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setPapers({ [query]: [] });
        toast.error('No papers found from either source');
      }
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  }, [yearFilter, isArXivMode]);

  useEffect(() => {
    if (mode === 'trending') {
      fetchTrendingPapers();
    } else if (mode === 'recent') {
      fetchRecentPapers();
    } else if (mode === 'topics') {
      fetchBestPapers();
    }
  }, [mode, yearFilter, fetchTrendingPapers, fetchRecentPapers, fetchBestPapers]);

  useEffect(() => {
    if (mode === 'search' && searchInitiated) {
      fetchSearchResults(searchTerm, yearFilter);
      setSearchInitiated(false);
    }
  }, [mode, searchInitiated, fetchSearchResults]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setMode('search');
      setSearchInitiated(true);
    }
  };

  const handleTrendingClick = () => {
    setMode('trending');
    setSearchTerm('');
    setYearFilter('');
  };

  const handleTopicsClick = () => {
    setMode('topics');
    setSearchTerm('');
  };

  const handleRecentClick = () => {
    setMode('recent');
    setSearchTerm('');
    setYearFilter('');
  };

  const handlePreviousTopic = () => {
    setCurrentTopicIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTopic = () => {
    const topics = getTopics();
    setCurrentTopicIndex(prev => Math.min(topics.length - 1, prev + 1));
  };

  const topics = getTopics();
  const currentTopic = topics[currentTopicIndex] || '';
  const currentPapers = papers[currentTopic] || [];
  const isLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4 md:px-6 pb-12 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >

          {/* Search & Filters */}
          <div className="mb-8">
            {/* Search row */}
            <div className="flex justify-center mb-4">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  className="glass-input pl-6 pr-28 w-full"
                  placeholder="Search by title, topic, author..."
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 py-2 px-3 text-sm rounded-lg 
                            bg-gradient-to-r from-red-500 to-purple-600 text-white 
                            shadow-lg shadow-indigo-300/40 
                            transition-all duration-300 hover:scale-70 hover:shadow-purple-400/50"
                >
                  Search 
                </button>
                
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsArXivMode(!isArXivMode)}
                  className={`absolute right-24 top-1/4 -translate-y-1/2 py-1 px-1 text-xs rounded-full 
                            transition-all duration-300 transform hover:scale-105
                            ${isArXivMode 
                              ? 'bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-lg shadow-green-400/40' 
                              : 'bg-gradient-to-r from-slate-400 to-slate-600 text-white shadow-lg shadow-slate-400/40'
                            }`}
                  style={{
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {isArXivMode ? "ArXiv ON" : "ArXiv OFF"}
                  {isArXivMode && (
                    <motion.span 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Mode indicator and switch button */}
            {mode === 'search' && (
              <div className="mt-2 text-sm text-slate-500 flex justify-center items-center">
                {isArXivMode 
                  ? "Searching arXiv: Use arXiv ID, DOI, or general terms" 
                  : "Searching Semantic Scholar: Use single query without commas"}
                <button
                  onClick={() => setIsArXivMode(!isArXivMode)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs underline"
                >
                  Switch to {isArXivMode ? "Semantic Scholar" : "arXiv"}
                </button>
              </div>
            )}
          
            {/* Filter buttons centered */}
            <div className="flex flex-wrap gap-4 justify-center items-center mt-4">
              <button
                onClick={handleTrendingClick}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  mode === 'trending'
                    ? 'bg-indigo-100/70 border border-indigo-300 text-indigo-700'
                    : 'glass-card-hover text-slate-700 hover:text-indigo-600'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Recent Papers</span>
              </button>
              <button
                onClick={handleRecentClick}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  mode === 'recent'
                    ? 'bg-indigo-100/70 border border-indigo-300 text-indigo-700'
                    : 'glass-card-hover text-slate-700 hover:text-indigo-600'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Relevant To Your Topics</span>
              </button>
              <button
                onClick={handleTopicsClick}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  mode === 'topics'
                    ? 'bg-indigo-100/70 border border-indigo-300 text-indigo-700'
                    : 'glass-card-hover text-slate-700 hover:text-indigo-600'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Best in Your Topics</span>
              </button>
          
              {/* Year filter stays inline if applicable */}
              {(mode === 'topics' || mode === 'search' || mode === 'recent') && (
                <div className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-white/60 border border-slate-200 text-slate-700`}>
                  <Calendar className="w-5 h-6 text-white-500" />
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 focus:outline-none"
                  >
                    <option value="">All Years (2014-Current)</option>
                    {Array.from(
                      { length: new Date().getFullYear() - 2014 + 1 },
                      (_, i) => 2014 + i
                    )
                      .reverse()
                      .map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {(isLoading || trendingLoading) && (
            <div className="flex items-center justify-center py-12">
              <div className="glass-card p-8 text-center">
                <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-slate-600">
                  {mode === 'search' 
                    ? 'Searching papers...' 
                    : mode === 'recent'
                    ? 'Loading recent papers...'
                    : mode === 'trending'
                    ? 'Loading trending papers...'
                    : 'Discovering best papers...'}
                </p>
              </div>
            </div>
          )}

          {/* Trending Papers Display */}
          {!trendingLoading && mode === 'trending' && (
            <>
              {topics.length > 0 ? (
                <div className="mb-12">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center justify-center gap-2">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                      Recent Papers
                    </h2>
                    <p className="text-sm text-slate-600 mt-2">Latest papers published in your topics</p>
                  </div>
                  
                  {Object.entries(trendingPapers).map(([topic, papers]) => (
                    <div key={topic} className="mb-10">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 bg-blue-100 p-3 rounded-lg flex items-center justify-center">
                        {topic}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {papers.map((paper, i) => (
                          <PaperCard key={paper.id} paper={paper} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="glass-card p-8 max-w-md mx-auto">
                    <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No Topics Added
                    </h3>
                    <p className="text-slate-600">
                      Add research topics to your profile to get trending paper recommendations
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Papers Display - Recent Mode */}
          {!isLoading && mode === 'recent' && (
            <>
              {topics.length > 0 ? (
                <div className="mb-12">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center justify-center gap-2">
                      <Clock className="w-6 h-6 text-indigo-600" />
                      Relevant Papers in Your Topics
                    </h2>
                    <p className="text-sm text-slate-600 mt-2">Entirely Related to Your Interest Topics</p>
                  </div>
                  
                  {topics.some(topic => papers[topic]?.length > 0) ? (
                    <div className="mb-12">
                      {/* Topic Navigation */}
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <button
                          onClick={handlePreviousTopic}
                          disabled={currentTopicIndex === 0}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                            currentTopicIndex === 0
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous Topic</span>
                        </button>
                        
                        <div className="flex flex-col items-center">
                          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-center">
                              {currentTopic}
                            </span>
                          </h2>
                          <div className="text-sm text-slate-500 mt-2">
                            Topic {currentTopicIndex + 1} of {topics.length}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleNextTopic}
                          disabled={currentTopicIndex === topics.length - 1}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                            currentTopicIndex === topics.length - 1
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          <span className="hidden sm:inline">Next Topic</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Papers Grid */}
                          {currentPapers.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {currentPapers.map((paper, i) => (
                            <PaperCard key={paper.id} paper={paper} />
                          ))}
                        </div>
                      ) : (
                        <div className="glass-card p-6 text-center">
                          <p className="text-slate-600">
                            No papers found for "{currentTopic}". Try updating to similar, popular keywords in your field.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass-card p-6 text-center">
                      <p className="text-slate-600">
                        No recent papers found for your topics. Try updating your profile with more specific research areas.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="glass-card p-8 max-w-md mx-auto">
                    <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No Topics Added
                    </h3>
                    <p className="text-slate-600">
                      Add research topics to your profile to get recent paper recommendations
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Papers Display - Topics Mode */}
          {!isLoading && mode === 'topics' && (
            <>
              {topics.length > 0 ? (
                <div className="mb-12">
                  {/* Topic Navigation */}
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <button
                      onClick={handlePreviousTopic}
                      disabled={currentTopicIndex === 0}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                        currentTopicIndex === 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous Topic</span>
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                        <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-center">
                          {currentTopic}
                        </span>
                      </h2>
                      <div className="text-sm text-slate-500 mt-2">
                        Topic {currentTopicIndex + 1} of {topics.length}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleNextTopic}
                      disabled={currentTopicIndex === topics.length - 1}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                        currentTopicIndex === topics.length - 1
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-indigo-600 hover:bg-indigo-100'
                      }`}
                    >
                      <span className="hidden sm:inline">Next Topic</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Papers Grid */}
                      {currentPapers.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentPapers.map((paper, i) => (
                        <PaperCard key={paper.id} paper={paper} />
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-6 text-center">
                      <p className="text-slate-600">
                        No papers found for "{currentTopic}". Try updating to similar, popular keywords in your field.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="glass-card p-8 max-w-md mx-auto">
                    <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      No Topics Added
                    </h3>
                    <p className="text-slate-600">
                      Add research topics to your profile to get personalized recommendations
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Papers Display - Search Mode */}
          {!isLoading && mode === 'search' && (
            <>
              {Object.entries(papers).map(([query, papersList]) => (
                <div key={query}>
                  {papersList.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {papersList.map((paper, i) => (
                        <PaperCard key={paper.id} paper={paper} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="glass-card p-8 max-w-md mx-auto">
                        <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          No Matching Papers Found
                        </h3>
                        <p className="text-slate-600">
                          Couldn't retrieve the correct paper. Please try:
                        </p>
                        <ul className="mt-3 text-left text-sm text-slate-600 space-y-1">
                          <li>• Check for spelling mistakes</li>
                          <li>• Search by author name</li>
                          <li>• Use more specific keywords</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}