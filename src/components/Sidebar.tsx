import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PenTool, Users, FileText, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from "../components/Logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { signOut } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: PenTool, label: 'Create Paper', path: '/first-author' },
    { icon: Users, label: 'Join Paper', path: '/collaborator' },
    { icon: FileText, label: 'My Papers', path: '/my-papers' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 glass-sidebar z-50 p-6"
          >
            <div className="flex items-center gap-3 mb-8 mt-4">
              <Logo width="340" height="60" viewBox="-150 0 1400 100" />
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `sidebar-nav flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-100/70 text-indigo-700 border border-indigo-200/50'
                        : 'text-slate-700 hover:bg-white/50 hover:text-indigo-600 hover:transform hover:translate-x-1'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}