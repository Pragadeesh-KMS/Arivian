import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Search,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Heart,
  Book,
  TrendingUp,
  FileText,
  Award,
  CheckCircle,
  FilePlus,
  FileMinus,
  Edit3,
  CheckSquare,
  Image,
  Bookmark,
  Lightbulb,
  MessageCircle,
  Tag,
  X,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import Logo from "../components/Logo";

const PaperDiscoverySection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.2 });

  const features = [
    {
      title: 'Recent Trending Papers',
      description: 'Discover the latest research papers gaining traction in your field',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      details: 'Stay up-to-date with the most discussed and cited papers published in the last few days across your topics of interest.',
      animation: 'trending'
    },
    {
      title: 'Relevant to Your Topics',
      description: 'Find papers specifically tailored to your research interests',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      details: 'Get personalized recommendations based on your profile topics with relevance ranking and smart filtering.',
      animation: 'relevant'
    },
    {
      title: 'Best in Your Topics',
      description: 'Explore the most influential papers in your research areas',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      details: 'Discover high-impact papers with the most citations and influence in your specific fields of study.',
      animation: 'best'
    },
    {
      title: 'Advanced Search',
      description: 'Powerful search across multiple databases with smart filters',
      icon: <Search className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      details: 'Search by title, author, keywords, or even arXiv ID with year filters and source selection (arXiv or Semantic Scholar).',
      animation: 'search'
    }
  ];

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveFeature(prev => (prev + 1) % features.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  const nextFeature = () => {
    setActiveFeature(prev => (prev + 1) % features.length);
    setIsPlaying(false);
  };

  const prevFeature = () => {
    setActiveFeature(prev => (prev - 1 + features.length) % features.length);
    setIsPlaying(false);
  };

  const FeatureAnimation = ({ type }) => {
    switch (type) {
      case 'trending':
        return (
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-3 w-64">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-2 shadow-md"
                  >
                    <div className="h-3 bg-blue-300 rounded mb-1"></div>
                    <div className="h-2 bg-blue-300 rounded w-3/4 mb-2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-2 w-8 bg-blue-400 rounded"></div>
                      <div className="h-2 w-4 bg-blue-400 rounded"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div 
              className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              TRENDING
            </motion.div>
          </div>
        );
      case 'relevant':
        return (
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64">
                <div className="flex mb-4">
                  {['ML', 'AI', 'NLP'].map((tag, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.2, duration: 0.5 }}
                      className="mr-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {tag}
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg shadow-sm"
                    >
                      <div className="h-3 bg-purple-200 rounded mb-1"></div>
                      <div className="h-2 bg-purple-200 rounded w-5/6"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'best':
        return (
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold">MOST CITATIONS</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[0, 1].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.3, duration: 0.5 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-3 bg-amber-200 rounded w-3/4"></div>
                        <div className="h-4 w-4 bg-amber-300 rounded-full flex items-center justify-center text-xs text-amber-800 font-bold">
                          {i === 0 ? '1' : '2'}
                        </div>
                      </div>
                      <div className="h-2 bg-amber-200 rounded w-5/6 mb-3"></div>
                      <div className="flex justify-between">
                        <div className="h-2 w-10 bg-amber-300 rounded"></div>
                        <div className="h-2 w-4 bg-amber-300 rounded"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative mb-4"
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value="attention mechanism transformer"
                    readOnly
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white rounded-lg shadow-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 bg-green-200 rounded w-3/4"></div>
                    <div className="h-4 w-4 bg-green-300 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-green-700" fill="currentColor" />
                    </div>
                  </div>
                  <div className="h-2 bg-green-200 rounded w-5/6 mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-2 w-10 bg-green-300 rounded"></div>
                    <div className="h-2 w-4 bg-green-300 rounded"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="paper-discovery" className="py-16 bg-gradient-to-b from-slate-50 to-indigo-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Smart Paper Discovery</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Find the perfect research papers with our intelligent discovery system tailored to your interests
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Content */}
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center text-white`}>
                    {features[activeFeature].icon}
                  </div>
                  {features[activeFeature].title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={prevFeature}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextFeature}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 mb-4">{features[activeFeature].description}</p>
              <p className="text-slate-500 text-sm">{features[activeFeature].details}</p>
            </div>

            <div className="flex gap-4 mb-8">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveFeature(index);
                    setIsPlaying(false);
                  }}
                  className={`flex-1 text-left p-2 rounded-xl transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white shadow-lg border border-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                      {feature.icon}
                    </div>
                    <span className="font-medium text-slate-800">{feature.title.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:gap-3"
            >
              Start Discovering Papers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Feature Visualization */}
          <div className="relative">
            <div className="glass-card rounded-2xl overflow-hidden p-6">
              <FeatureAnimation type={features[activeFeature].animation} />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);

  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsRef,
    offset: ["start center", "end center"]
  });

  const { scrollYProgress: featuresProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });

  const featureOpacity = useTransform(featuresProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 0, 0, 0, 0]);
  const featureScale = useTransform(featuresProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0.8, 1, 0.8, 0.8, 0.8, 0.8]);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Feature cards with detailed information
  const features = [
    {
      title: 'AI-Powered Research',
      description: 'Chat with AI about any paper, ask questions, and get intelligent insights.',
      icon: <MessageCircle className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      details: [
        'Ask up to 5 questions per paper',
        'PDF content processing for deeper analysis',
        'Context-aware responses based on paper content',
        'Streaming responses for real-time interaction'
      ]
    },
    {
      title: 'Smart Paper Discovery',
      description: 'Find research papers across multiple databases with intelligent recommendations.',
      icon: <Search className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      details: [
        'Search across arXiv, Semantic Scholar, and more',
        'Personalized recommendations based on your interests',
        'Advanced filtering by citations, date, and field',
        'Related papers and similar research suggestions'
      ]
    },
    {
      title: 'Paper Management',
      description: 'Organize your research library with tags, collections, and smart categorization.',
      icon: <Bookmark className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-500',
      details: [
        'Custom tagging system for organization',
        'Save papers to personalized collections',
        'Track your reading progress',
        'Export references in multiple formats'
      ]
    },
    {
      title: 'Collaborative Research',
      description: 'Work with others on papers, share insights, and co-author research.',
      icon: <Users className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      details: [
        'Invite collaborators to your papers',
        'Real-time editing and commenting',
        'Version history and change tracking',
        'Role-based permissions system'
      ]
    },
    {
      title: 'PDF Intelligence',
      description: 'Extract insights from PDFs, process content, and chat with document contents.',
      icon: <FileText className="w-8 h-8" />,
      color: 'from-red-500 to-rose-500',
      details: [
        'PDF text extraction and processing',
        'Configurable page filtering',
        'Chunking for better AI comprehension',
        'Direct PDF viewing within the platform'
      ]
    },
    {
      title: 'Publication Tools',
      description: 'Write, format, and prepare your research for publication with AI assistance.',
      icon: <Edit3 className="w-8 h-8" />,
      color: 'from-indigo-500 to-blue-500',
      details: [
        'AI-assisted writing and editing',
        'Journal template formatting',
        'Citation and reference management',
        'Collaboration tracking and author management'
      ]
    }
  ];

  const steps = [
    {
      step: 1,
      icon: <FilePlus className="w-8 h-8" />,
      title: 'Create Your Paper',
      description: 'Start a new research project with our intuitive paper creation tools',
      color: 'bg-blue-100'
    },
    {
      step: 2,
      icon: <Users className="w-8 h-8" />,
      title: 'Invite Collaborators',
      description: 'Bring together researchers from around the world to work on your project',
      color: 'bg-green-100'
    },
    {
      step: 3,
      icon: <Edit3 className="w-8 h-8" />,
      title: 'Write with AI Assistance',
      description: 'Get AI-powered suggestions for content, structure, and references',
      color: 'bg-purple-100'
    },
    {
      step: 4,
      icon: <CheckSquare className="w-8 h-8" />,
      title: 'Fact-Check & Enhance',
      description: 'Use AI to verify claims and improve your paper\'s quality',
      color: 'bg-amber-100'
    },
    {
      step: 5,
      icon: <FileMinus className="w-8 h-8" />,
      title: 'Submit for Publication',
      description: 'Export your paper in the required format for any journal',
      color: 'bg-indigo-100'
    }
  ];
  
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      } 
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      } 
    }
  };

  // Interactive paper card preview
  const PaperCardPreview = () => {
    return (
      <motion.div
        whileHover={{ y: -5, rotate: -0.5 }}
        className="glass-card p-5 rounded-xl h-full flex flex-col relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <div className="p-1 text-red-500">
              <Heart className="w-4 h-4 fill-red-500" />
            </div>
            <div className="p-1 text-green-500">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          
          <div className="relative p-1.5 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/30 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-xl" />
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="w-3 h-3 drop-shadow-md"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 mt-2">
          <h3 className="font-bold text-slate-800 line-clamp-2 text-base leading-tight mb-3">
            Attention Is All You Need: The Revolutionary Transformer Architecture
          </h3>
          
          <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
            <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              12.5K citations
            </span>
            <span>2017</span>
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-3 mb-4">
            We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, 
            dispensing with recurrence and convolutions entirely. Experiments show these models to be superior in 
            quality while being more parallelizable and requiring significantly less time to train.
          </p>
        </div>
        
        <div className="mt-auto">
          <div className="text-sm text-slate-600">
            <p className="font-semibold mb-1">Authors:</p>
            <p className="line-clamp-1 italic">
              Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, rgb(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 255}), transparent)`
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1 + Math.random() * 0.5]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Sticky Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl mx-6 mt-6 mb-8 p-4 sticky top-6 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo width="240" height="40" viewBox="-100 0 1400 100" />
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#paper-discovery" className="text-slate-700 hover:text-teal-800 hover:bg-violet-100 transition-colors px-2 py-1 rounded-full">Paper Discovery</a>
            <a href="#features" className="text-slate-700 hover:text-teal-800 hover:bg-violet-100 transition-colors px-2 py-1 rounded-full">Features</a>
            <a href="#how-it-works" className="text-slate-700 hover:text-teal-800 hover:bg-violet-100 transition-colors px-2 py-1 rounded-full">How It Works</a>
            <a href="#ai-assistance" className="text-slate-700 hover:text-teal-800 hover:bg-violet-100 transition-colors px-2 py-1 rounded-full">AI Assistance</a>
            <a href="#pricing" className="text-slate-700 hover:text-teal-800 hover:bg-violet-100 transition-colors px-2 py-1 rounded-full">Pricing</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-slate-700 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-6 md:py-8 text-center relative overflow-hidden min-h-[70vh] flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">AI-Powered Research Platform</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Revolutionize
            </span>
            <br />
            <span className="text-slate-800">Your Research Journey</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Connect with researchers worldwide, discover cutting-edge papers, and collaborate on groundbreaking research with the power of AI.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link
              to="/signup"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20 text-lg inline-flex items-center gap-2"
            >
              Start Research <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl px-8 py-4 text-slate-700 hover:text-indigo-600 font-medium transition-colors duration-200 inline-flex items-center gap-2"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Floating 3D Elements */}
        <motion.div 
          className="absolute top-1/4 left-1/4 -translate-x-1/2"
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg shadow-red-400/50 transform rotate-12 animate-pulse"></div>
            <div className="absolute inset-0.5 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping opacity-20"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute top-1/3 right-1/4 -translate-y-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg shadow-purple-400/50 transform rotate-3 animate-pulse"></div>
            <div className="absolute inset-0.5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Book className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-lg border-2 border-purple-400/50 animate-ping opacity-20"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/4 left-1/3"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg shadow-blue-400/50 transform -rotate-3 animate-pulse"></div>
            <div className="absolute inset-0.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-lg border-2 border-blue-400/50 animate-ping opacity-20"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 right-1/3"
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-400/50 transform rotate-6 animate-pulse"></div>
            <div className="absolute inset-0.5 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping opacity-20"></div>
          </div>
        </motion.div>
      </section>

      {/* Paper Discovery Section */}
      <PaperDiscoverySection />

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="px-6 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Powerful Research Features</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to discover, organize, and collaborate on research
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="px-6 py-16 bg-gradient-to-b from-indigo-50 via-purple-50 to-indigo-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">Interactive Paper Discovery</h2>
              <p className="text-lg text-slate-600 mb-6">
                Explore papers with our beautiful card interface, save what interests you, and get AI-powered recommendations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-green-600" fill="currentColor" />
                  </div>
                  <span className="text-slate-700">Save papers to your personal library</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-slate-700">Organize with custom tags</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Chat with AI about any paper</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-slate-700">Get personalized recommendations</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative glass-card p-6 rounded-2xl">
                <PaperCardPreview />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Chat Demo */}
      <section className="px-6 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">AI Research Assistant</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Chat with AI about any paper, ask questions, and get intelligent insights
            </p>
          </motion.div>

          <div className="glass-card rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Chat with AI about this paper</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Chatting with PDF</span>
                </div>
                <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-white">
              <div className="space-y-4 mb-6">
                <div className="flex justify-end">
                  <div className="bg-blue-100 rounded-lg p-4 max-w-3/4">
                    <p className="text-slate-800">What are the main contributions of this paper?</p>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-lg p-4 max-w-3/4">
                  <p className="text-slate-800">
                    The main contributions of "Attention Is All You Need" are:
                    <br />
                    • Introduction of the Transformer architecture based solely on attention mechanisms
                    <br />
                    • Demonstration that recurrent and convolutional layers are not necessary for state-of-the-art performance
                    <br />
                    • Introduction of multi-head self-attention for capturing different representation subspaces
                    <br />
                    • Achieving new state-of-the-art results in machine translation with significantly less training time
                  </p>
                </div>
              </div>

              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Ask a question about this paper..."
                  className="flex-1 p-4 focus:outline-none"
                  disabled
                />
                <button className="p-4 bg-blue-500 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-500 mt-2 text-center">3 of 5 questions used</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Steps Section */}
      <section 
        id="how-it-works" 
        className="px-6 py-16 bg-gradient-to-b from-white to-blue-50"
        ref={stepsRef}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              How Arivian Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From idea to publication in five simple steps
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Animated Timeline */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 hidden md:block">
              <motion.div 
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500 to-purple-500"
                style={{ 
                  scaleY: stepsProgress,
                  transformOrigin: "top center",
                  boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"
                }}
              />
            </div>
            
            <div className="space-y-16">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={variants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center gap-8`}
                >
                  <div className="md:w-1/2">
                    <motion.div 
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${step.color} border-2 border-transparent`}
                      animate={{ 
                        scale: stepsProgress.get() > (index * 0.2) ? 1.1 : 1,
                        borderColor: stepsProgress.get() > (index * 0.2)
                          ? "rgba(139, 92, 246, 0.5)" 
                          : "transparent",
                        boxShadow: stepsProgress.get() > (index * 0.2)
                          ? "0 0 20px rgba(139, 92, 246, 0.5)" 
                          : "none"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        {step.icon}
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="md:w-1/2 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6"
                    animate={{
                      borderColor: stepsProgress.get() > (index * 0.2)
                        ? "rgba(139, 92, 246, 0.5)" 
                        : "transparent",
                      boxShadow: stepsProgress.get() > (index * 0.2)
                        ? "0 0 25px rgba(139, 92, 246, 0.3)" 
                        : "0 4px 20px rgba(0,0,0,0.1)",
                      backgroundColor: stepsProgress.get() > (index * 0.2)
                        ? "rgba(255, 255, 255, 0.9)" 
                        : "rgba(255, 255, 255, 0.7)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-indigo-600 font-bold text-2xl mb-2">Step {step.step}</div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistance Section */}
      <section id="ai-assistance" className="px-6 py-16 relative bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: explainer + CTA */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Research Assistance
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mb-6">
                Transform your workflow with lightweight, human-centered AI tools - from outlines and citations to verification and visuals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Content Generation</div>
                      <div className="text-sm text-slate-500">Draft headings, abstracts and section drafts instantly</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Reference Suggestions</div>
                      <div className="text-sm text-slate-500">Contextual citations surfaced as you write</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Fact Verification</div>
                      <div className="text-sm text-slate-500">AI checks claims and highlights uncertain statements</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white">
                      <Image className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Visual Creation</div>
                      <div className="text-sm text-slate-500">Diagrams and figures tailored to your paper</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                >
                  Try AI Tools <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right: interactive mock panel */}
            <motion.div
              className="lg:col-span-6 relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* faux app preview stack */}
                <div className="mx-auto w-full max-w-md">
                  <motion.div
                    whileHover={{ rotate: -1, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">R</div>
                        <div className="text-sm font-semibold">AI Assistant</div>
                      </div>
                      <div className="text-xs text-slate-400">Draft mode</div>
                    </div>

                    <div className="p-4">
                      <div className="h-32 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-3">
                        <div className="text-sm text-slate-600 mb-2">Suggested abstract</div>
                        <div className="text-sm text-slate-800 font-medium leading-relaxed">
                          <span>AI:</span> A concise abstract generated in seconds - contextual, in-style, and reference-aware.
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 text-sm py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm">Use suggestion</button>
                        <button className="flex-none px-3 py-2 rounded-lg bg-indigo-600 text-white">Edit</button>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <div>References: 4 suggested</div>
                        <div>Confidence: <span className="font-medium text-slate-700">High</span></div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* small floating badges */}
                <div className="absolute -right-6 -top-6 w-36 h-36 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 opacity-80 blur-sm" />
                <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 opacity-80 blur-sm" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <motion.div
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-white/70 backdrop-blur-xl border border-white/20 p-12 rounded-3xl shadow-2xl"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of researchers already using Arivian to accelerate their discoveries.
          </p>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20 text-lg inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-indigo-900 to-indigo-950 py-8 px-6 mt-8 pt-6 text-center text-purple-400 text-sm">
        <p>© 2025 Arivian. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;