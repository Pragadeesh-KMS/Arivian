import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Search, Users, PenTool, BookOpen, ArrowRight, Sparkles, Heart, Book,
  TrendingUp, FileText, Award, BarChart3,
  ChevronDown, ChevronUp, CheckCircle, Plus, User, Calendar, ExternalLink, Lock,
  Mail as MailIcon, Globe as GlobeIcon,
  GraduationCap, Briefcase, FilePlus, FileCheck, FileMinus, FileLock,
  Lightbulb, Brain, Edit3, CheckSquare, Image, MessageSquare, Bookmark
} from 'lucide-react';

const LandingPage = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const stepsRef = useRef(null);

  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsRef,
    offset: ["start center", "end center"]
  });

  const thresholds = [0.1, 0.3, 0.5, 0.7, 0.9];
  const stepProgress = thresholds.map((threshold, i) =>
    useTransform(
      stepsProgress,
      [i > 0 ? thresholds[i - 1] : 0, threshold],
      [0, 1]
    )
  );

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const Heart3D = () => (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg shadow-red-400/50 transform rotate-12 animate-pulse"></div>
      <div className="absolute inset-0.5 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
        <Heart className="w-10 h-10 text-white" fill="currentColor" />
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping opacity-20"></div>
    </div>
  );

  const Book3D = () => (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg shadow-purple-400/50 transform rotate-3 animate-pulse"></div>
      <div className="absolute inset-0.5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
        <Book className="w-10 h-10 text-white" fill="currentColor" />
      </div>
      <div className="absolute inset-0 rounded-lg border-2 border-purple-400/50 animate-ping opacity-20"></div>
    </div>
  );

  const Paper3D = () => (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg shadow-blue-400/50 transform -rotate-3 animate-pulse"></div>
      <div className="absolute inset-0.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
        <FileText className="w-10 h-10 text-white" fill="currentColor" />
      </div>
      <div className="absolute inset-0 rounded-lg border-2 border-blue-400/50 animate-ping opacity-20"></div>
    </div>
  );

  const Collab3D = () => (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-400/50 transform rotate-6 animate-pulse"></div>
      <div className="absolute inset-0.5 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
        <Users className="w-10 h-10 text-white" fill="currentColor" />
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping opacity-20"></div>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Sticky Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl mx-6 mt-6 mb-8 p-4 sticky top-6 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Arivian
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-700 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-700 hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#ai-assistance" className="text-slate-700 hover:text-indigo-600 transition-colors">AI Assistance</a>
            <a href="#testimonials" className="text-slate-700 hover:text-indigo-600 transition-colors">Testimonials</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-slate-700 hover:text-indigo-600 font-medium transition-colors duration-200"
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
      <section className="px-6 py-16 md:py-24 text-center relative overflow-hidden min-h-[70vh] flex items-center">
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
          <Heart3D />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/3 right-1/4 -translate-y-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
        >
          <Book3D />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/4 left-1/3"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        >
          <Paper3D />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 right-1/3"
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
        >
          <Collab3D />
        </motion.div>
      </section>

            {/* Paper Discovery Flow Section */}
      <section className="px-6 py-24 bg-gradient-to-b from-indigo-50 via-purple-50 to-indigo-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Find, Get Recommended & Save Papers
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Search across millions of papers, get topic-based recommendations, and save the ones you love - all in one beautiful, interactive workspace.
            </p>
          </motion.div>

          {/* Interactive Steps */}
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 - Search */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg p-8 relative"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full shadow-lg shadow-indigo-400/50 animate-pulse"></div>
                  <div className="absolute inset-0.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping opacity-20"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 text-center mt-12 mb-4">Search Any Topic</h3>
              <p className="text-slate-600 text-center">
                Type your keywords, author names, or paper titles - our AI finds the exact papers you need in seconds.
              </p>
            </motion.div>

            {/* Step 2 - Recommendations */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg p-8 relative"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full shadow-lg shadow-pink-400/50 animate-pulse"></div>
                  <div className="absolute inset-0.5 bg-gradient-to-br from-pink-500 to-rose-700 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-pink-400/50 animate-ping opacity-20"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 text-center mt-12 mb-4">Personalized Recommendations</h3>
              <p className="text-slate-600 text-center">
                Based on your profile topics and recent reads, get a tailored feed of the most relevant and groundbreaking papers.
              </p>
            </motion.div>

            {/* Step 3 - Save */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg p-8 relative"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg shadow-red-400/50 animate-pulse"></div>
                  <div className="absolute inset-0.5 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" fill="currentColor" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping opacity-20"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 text-center mt-12 mb-4">Save & Read Later</h3>
              <p className="text-slate-600 text-center">
                Like papers you love with a glowing heart, or bookmark them to revisit anytime from your reading list.
              </p>
            </motion.div>
          </div>

          {/* Decorative floating blobs */}
          <motion.div
            className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 opacity-40 blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-pink-200 to-red-200 opacity-40 blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
        </div>
      </section>


      {/* Enhanced Features Section - Minimalist Redesign */}
      <section 
        id="features" 
        className="px-6 py-24 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column - Headline + highlights */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Everything You Need for <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">Research Excellence</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-xl">
                A single, beautiful workspace where discovery, collaboration, and publication converge - crafted for researchers who expect precision, speed, and delightful UX.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex-none w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-white/30 shadow-sm">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Polished Research Dashboard</div>
                    <div className="text-sm text-slate-500">Gain instant insights into your projects, metrics, and collaboration activity.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex-none w-10 h-10 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border border-white/30 shadow-sm">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Global Collaboration Hub</div>
                    <div className="text-sm text-slate-500">Invite, review, and coordinate across teams with built-in versioned editing.</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex-none w-10 h-10 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center border border-white/30 shadow-sm">
                    <Award className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Publisher-Ready Export</div>
                    <div className="text-sm text-slate-500">Templates, formatting, and submission assets tailored to journals.</div>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                >
                  Get Started - It's Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Column - Feature Mosaic */}
            <motion.div
              className="lg:col-span-7 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Decorative floating gradient blob */}
              <div className="pointer-events-none absolute -right-8 -top-6 w-72 h-72 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-200 blur-3xl opacity-60 transform rotate-12" />

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: 'AI-Powered Search', desc: 'Find the exact papers you need in seconds.', icon: <Search className="w-6 h-6" /> },
                  { title: 'Save & Organize', desc: 'Smart collections, tags and reading lists.', icon: <Bookmark className="w-6 h-6" /> },
                  { title: 'Personalized Feed', desc: 'Recommendations tailored to your work.', icon: <TrendingUp className="w-6 h-6" /> },
                  { title: 'Citation Manager', desc: 'Insert properly-formatted references in one click.', icon: <FileText className="w-6 h-6" /> },
                  { title: 'Visual Tools', desc: 'Create diagrams and charts for your paper.', icon: <Image className="w-6 h-6" /> },
                  { title: 'Fact Verification', desc: 'AI-assisted checks for critical claims.', icon: <CheckCircle className="w-6 h-6" /> }
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03, y: -6 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                    className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg overflow-hidden"
                  >
                    <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 opacity-60 transform rotate-12" />
                    <div className="flex items-start gap-4">
                      <div className="flex-none w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                        {f.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{f.title}</div>
                        <div className="text-sm text-slate-500">{f.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
                        scale: stepProgress[index].get() > 0.5 ? 1.1 : 1,
                        borderColor: stepProgress[index].get() > 0.5 
                          ? "rgba(139, 92, 246, 0.5)" 
                          : "transparent",
                        boxShadow: stepProgress[index].get() > 0.5 
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
                      borderColor: stepProgress[index].get() > 0.5 
                        ? "rgba(139, 92, 246, 0.5)" 
                        : "transparent",
                      boxShadow: stepProgress[index].get() > 0.5 
                        ? "0 0 25px rgba(139, 92, 246, 0.3)" 
                        : "0 4px 20px rgba(0,0,0,0.1)",
                      backgroundColor: stepProgress[index].get() > 0.5 
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

      {/* AI Assistance Section - Minimalist Redesign */}
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
