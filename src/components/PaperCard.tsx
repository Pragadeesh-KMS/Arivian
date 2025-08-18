import React from 'react';
import { Book, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Paper } from '../types/paper';
import toast from 'react-hot-toast';

interface PaperCardProps {
  paper: Paper;
  onRemove?: (paperId: string) => void;
  showHeartAsSaved?: boolean;
  showBookAsSaved?: boolean;
}

const PaperCard = ({ 
  paper, 
  onRemove,
  showHeartAsSaved = false,
  showBookAsSaved = false
}: PaperCardProps) => {
  const { 
    user, 
    savePaper, 
    saveToReadLater, 
    savedPaperIds, 
    readLaterPaperIds 
  } = useAuth();

  
  const isSaved = savedPaperIds.has(paper.id);
  const isReadLater = readLaterPaperIds.has(paper.id);
  
  const source = paper.pdfUrl ? 'arxiv' : 'semantic-scholar';

  const handleSavePaper = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const paperData = {
      paper_id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      url: paper.url,
      source
    };
    
    await savePaper(paperData);
    
    if (isSaved && onRemove) {
      onRemove(paper.id);
    }
  };

  const handleReadLater = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const paperData = {
      paper_id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      url: paper.url,
      source
    };
    
    await saveToReadLater(paperData);
    
    if (isReadLater && onRemove) {
      onRemove(paper.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-xl cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
      onClick={() => window.open(paper.url, '_blank')}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          <button 
            onClick={handleReadLater}
            className="p-1 text-purple-600 hover:bg-purple-100 rounded-full"
            title={isReadLater ? "Remove from Read Later" : "Save to Read Later"}
          >
            <Book className={`w-4 h-4 ${isReadLater ? 'fill-purple-600' : ''}`} />
          </button>
          <button 
            onClick={handleSavePaper}
            className="p-1 text-red-500 hover:bg-red-100 rounded-full"
            title={isSaved ? "Remove from Saved" : "Save to My Interests"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
          </button>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
      
      <div className="flex-1 mt-2">
        <h3 className="font-bold text-slate-800 line-clamp-2 text-base leading-tight mb-3">
          {paper.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
          {paper.citationCount > 0 ? (
            <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              {paper.citationCount} citations
            </span>
          ) : (
            <span className="font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
              Preprint
            </span>
          )}
          <span>
            {paper.published ? new Date(paper.published).toLocaleDateString() : 'Unknown date'}
          </span>
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">
          {paper.abstract || 'No abstract available'}
        </p>
      </div>
      
      <div className="mt-auto">
        <div className="text-sm text-slate-600">
          <p className="font-semibold mb-1">Authors:</p>
          <p className="line-clamp-1 italic">
            {paper.authors.join(', ')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PaperCard;