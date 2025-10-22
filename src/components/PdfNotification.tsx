import React, { useEffect } from "react";
import { X, ExternalLink, Sparkles, MessageCircle, Copy } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { setCurrentNotification, clearCurrentNotification } from '../utils/notificationState';
interface PdfNotificationProps {
  paperTitle: string;
  pdfUrl: string;
  sourceName: string;
  onOpen: () => void;
  onDismiss: () => void;
  onChat: () => void;
  onRecommend: () => void;
}

const PdfNotification = ({
  paperTitle,
  pdfUrl,
  sourceName,
  onOpen,
  onDismiss,
  onChat,
  onRecommend,
}: PdfNotificationProps) => {
  useEffect(() => {
    setCurrentNotification(onDismiss);
    return () => clearCurrentNotification();
  }, [onDismiss]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const copyLinkToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pdfUrl);
    toast.success("PDF link copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      transition={{ type: "spring", damping: 18, stiffness: 220 }}
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
      onClick={handleContainerClick}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/70 to-neutral-800/50 backdrop-blur-xl" />
        <div className="absolute inset-0 rounded-xl border border-white/10" />
        <div className="relative rounded-xl p-4 shadow-xl">
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-15"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  scale: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/10 rounded-md shadow-sm">
                <Sparkles className="w-4 h-4 text-white/90" />
              </div>
              <h3 className="font-medium text-white text-sm tracking-wide">
                PDF Ready
              </h3>
            </div>
            <motion.button
              onClick={onDismiss}
              whileHover={{
                scale: 1.12,
                rotate: 90,
                transition: { duration: 0.14 },
              }}
              whileTap={{ scale: 0.95 }}
              className="p-1 bg-white/10 hover:bg-red-600/20 rounded-full transition-all group"
              aria-label="Dismiss"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-white/80 group-hover:text-red-400 transition-colors" />
            </motion.button>
          </div>

          {/* Source Info */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-xs text-white/70 mb-2 relative z-10"
          >
            PDF from{" "}
            <span className="font-medium text-white">{sourceName}</span>
          </motion.p>

          {/* Raw PDF Link */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="mb-3 relative z-10 w-full flex items-center"
          >
            <div className="flex items-center bg-black/30 rounded-lg p-2 flex-1 min-w-0">
              <p
                className="text-xs text-blue-300 truncate mr-2 flex-1 min-w-0"
                title="PDF link"
              >
                {pdfUrl}
              </p>
              <motion.button
                onClick={copyLinkToClipboard}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 p-1 bg-blue-500/30 hover:bg-blue-500/40 rounded-md transition-colors"
                title="Copy link"
                aria-label="Copy link"
              >
                <Copy className="w-3 h-3 text-white" />
              </motion.button>
            </div>
            <motion.button
              onClick={onOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-3 flex-shrink-0 p-1 bg-green-500/30 hover:bg-green-500/40 rounded-md transition-colors"
              title="Open PDF in new tab"
              aria-label="Open PDF in new tab"
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </motion.button>
          </motion.div>


          {/* Paper Title */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-medium text-white mb-3 line-clamp-2 relative z-10"
          >
            {paperTitle}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-between items-center gap-2 relative z-10"
          >
            {/* Chat with AI Button */}
            <motion.button
              onClick={onChat}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-1.5 text-xs px-4 py-2 rounded-md overflow-hidden 
                        bg-gradient-to-br from-purple-500/40 to-pink-500/30 
                        text-white border border-white/20 shadow-xl 
                        backdrop-blur-md transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Chat with AI</span>
              <span className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent opacity-40 pointer-events-none" />
              <span className="absolute inset-0 -translate-x-full glass-shine pointer-events-none" />
            </motion.button>

            {/* Recommendations Button */}
            <motion.button
              onClick={onRecommend}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-1.5 text-xs px-4 py-2 rounded-md overflow-hidden 
                        bg-gradient-to-br from-blue-500/40 to-purple-500/30 
                        text-white border border-white/20 shadow-xl 
                        backdrop-blur-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Recommendations</span>
              <span className="absolute inset-0 bg-gradient-to-tr from-white/25 to-transparent opacity-40 pointer-events-none" />
              <span className="absolute inset-0 -translate-x-full glass-shine pointer-events-none" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Liquid Glass Animation */}
      <style>{`
        @keyframes glass-shine {
          0% { transform: translateX(-100%); opacity: 0; }
          30% { opacity: 0.45; }
          60% { transform: translateX(200%); opacity: 0.45; }
          100% { transform: translateX(200%); opacity: 0; }
        }

        .glass-shine {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
          will-change: transform, opacity;
          animation: none;
        }

        .group:hover .glass-shine {
          animation: glass-shine 1.6s ease-in-out 1;
        }
      `}</style>
    </motion.div>
  );
};

export default PdfNotification;