import React, { useState } from 'react';
import { Menu, User, X, CheckCircle, AlertCircle, Clock, Heart, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Brain } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  showMenu?: boolean;
}

export default function Header({ onMenuToggle, showMenu = true }: HeaderProps) {
  const { user, profile } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getProfileCompletionStatus = () => {
    if (!profile) return { percentage: 20, color: 'red', icon: AlertCircle };
    
    let completed = 2; 
    const total = 12; 
    
    if (profile.contact_no) completed++;
    
    if (profile.profession) completed++;
    if (profile.university) completed++;
    
    if (profile.topic1) completed++;
    if (profile.topic2) completed++;
    if (profile.topic3) completed++;
    if (profile.topic4) completed++;
    if (profile.topic5) completed++;
    
    if (profile.portfolio_link) completed++;
    
    if (profile.research_papers?.length) completed++;
    
    const percentage = Math.round((completed / total) * 100);
    
    if (percentage >= 80) return { percentage, color: 'green', icon: CheckCircle };
    if (percentage >= 50) return { percentage, color: 'yellow', icon: Clock };
    return { percentage, color: 'red', icon: AlertCircle };
  };

  const status = getProfileCompletionStatus();
  const userName = user?.user_metadata?.full_name || profile?.username || 'User';

  return (
    <>
      <header className="glass-card mx-6 mt-6 mb-8 p-4 sticky top-6 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showMenu && (
              <button
                onClick={onMenuToggle}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors duration-200"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Arivian
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:block text-slate-700 font-medium">
                Welcome back, {userName}!
              </div>
            )}
            {/* NEW: Buttons for Liked Papers and Read Later */}
            {user && (
              <>
                <Link 
                  to="/liked-papers"
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
                  title="Liked Papers"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link 
                  to="/read-later"
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors duration-200"
                  title="Read Later"
                >
                  <Book className="w-5 h-5" />
                </Link>
              </>
            )}
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors duration-200 relative"
            >
              <User className="w-6 h-6 text-slate-700" />
              {user && (
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  status.color === 'green' ? 'bg-green-500' : 
                  status.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <status.icon className="w-2 h-2 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showProfileModal && user && (
          <ProfileModal 
            onClose={() => setShowProfileModal(false)}
            profileStatus={status}
          />
        )}
      </AnimatePresence>
    </>
  );
}