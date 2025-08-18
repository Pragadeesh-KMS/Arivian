import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  X, User, Mail, Phone, Briefcase, GraduationCap, 
  Link as LinkIcon, FileText, Plus, Trash2, Save, Copy, Check 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object({
  username: yup.string().required('Name is required'),
  contact_no: yup.string(),
  profession: yup.string(),
  university: yup.string(),
  topic1: yup.string(),
  topic2: yup.string(),
  topic3: yup.string(),
  topic4: yup.string(),
  topic5: yup.string(),
  portfolio_link: yup.string().url('Invalid URL').nullable(),
});

type FormData = yup.InferType<typeof schema>;

interface ResearchPaper {
  title: string;
  url: string;
}

interface ProfileModalProps {
  onClose: () => void;
  profileStatus: {
    percentage: number;
    color: string;
  };
}

export default function ProfileModal({ onClose, profileStatus }: ProfileModalProps) {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>(
    (profile?.research_papers as ResearchPaper[]) || [{ title: '', url: '' }]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: profile?.username || user?.user_metadata?.full_name || '',
      contact_no: profile?.contact_no || '',
      profession: profile?.profession || '',
      university: profile?.university || '',
      topic1: profile?.topic1 || '',
      topic2: profile?.topic2 || '',
      topic3: profile?.topic3 || '',
      topic4: profile?.topic4 || '',
      topic5: profile?.topic5 || '',
      portfolio_link: profile?.portfolio_link || '',
    },
  });

  const addResearchPaper = () => {
    setResearchPapers([...researchPapers, { title: '', url: '' }]);
  };

  const removeResearchPaper = (index: number) => {
    if (researchPapers.length > 1) {
      setResearchPapers(researchPapers.filter((_, i) => i !== index));
    }
  };

  const updateResearchPaper = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...researchPapers];
    updated[index][field] = value;
    setResearchPapers(updated);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    const validPapers = researchPapers.filter(paper => paper.title && paper.url);

    const success = await updateProfile({
      email: user?.email,
      username: data.username,
      contact_no: data.contact_no,
      profession: data.profession,
      university: data.university,
      topic1: data.topic1,
      topic2: data.topic2,
      topic3: data.topic3,
      topic4: data.topic4,
      topic5: data.topic5,
      portfolio_link: data.portfolio_link,
      research_papers: validPapers.length > 0 ? validPapers : null,
    });

    if (success) {
      onClose();
    }
    setLoading(false);
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text?: string) => {
    const val = text ?? profile?.user_id ?? '';
    if (!val) return;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(val);
      } else {
        const ta = document.createElement('textarea');
        ta.value = val;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Profile Setup</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    profileStatus.color === 'green' ? 'bg-green-500' :
                    profileStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${profileStatus.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600">
                {profileStatus.percentage}% Complete
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Personal Information
            </h3>
          
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('username')}
                  type="text"
                  className="glass-input pl-12 w-full"
                  placeholder="Enter your full name"
                  aria-label="Full name"
                />
              </div>
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>
          
            <div className="grid md:grid-cols-2 gap-4">
              {/* Profile ID */}
              <div className="form-group">
                <label className="form-label">Your Collaborator UUID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={user?.id || ''}
                    readOnly
                    className="glass-input pl-3 w-full cursor-not-allowed opacity-70"
                    aria-label="Your collaborator UUID"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user?.id)}
                    className="glass-button p-2 flex items-center justify-center"
                    title="Copy UUID"
                  >
                    <AnimatePresence initial={false} mode="wait">
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -90, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, rotate: 90, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 800, damping: 20, duration: 0.2 }}
                        >
                          <Check className="w-4 h-4 text-white-600" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0, rotate: 90, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, rotate: -90, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 800, damping: 20, duration: 0.2 }}
                        >
                          <Copy className="w-4 h-4 text-white-700" />
                        </motion.span>
                      )}
                    </AnimatePresence>

                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Share this with paper authors to get added as collaborator
                </p>
              </div>
          
              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="glass-input pl-12 w-full opacity-60 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('contact_no')}
                  type="tel"
                  className="glass-input pl-12 w-full"
                  placeholder="Enter your contact number"
                />
              </div>
            </div>
          </div>


          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Professional Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Profession</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('profession')}
                    type="text"
                    className="glass-input pl-12 w-full"
                    placeholder="e.g., PhD Student, Professor"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">University/Institution</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('university')}
                    type="text"
                    className="glass-input pl-12 w-full"
                    placeholder="Enter your institution"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Research Topics</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(5)].map((_, i) => (
                  <input
                    key={i}
                    {...register(`topic${i+1}` as keyof FormData)}
                    type="text"
                    className="glass-input w-full"
                    placeholder={`Topic ${i+1}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio/Website Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('portfolio_link')}
                  type="url"
                  className="glass-input pl-12 w-full"
                  placeholder="https://your-portfolio.com"
                />
              </div>
              {errors.portfolio_link && (
                <p className="form-error">{errors.portfolio_link.message}</p>
              )}
            </div>
          </div>

          {/* Research Papers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 flex-1">
                Published Research Papers
              </h3>
              <button
                type="button"
                onClick={addResearchPaper}
                className="glass-button py-2 px-4 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Paper
              </button>
            </div>
            
            {researchPapers.map((paper, index) => (
              <div key={index} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-700">Paper #{index + 1}</h4>
                  {researchPapers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResearchPaper(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={paper.title}
                      onChange={(e) => updateResearchPaper(index, 'title', e.target.value)}
                      className="glass-input pl-10 w-full"
                      placeholder="Paper title"
                    />
                  </div>
                  
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={paper.url}
                      onChange={(e) => updateResearchPaper(index, 'url', e.target.value)}
                      className="glass-input pl-10 w-full"
                      placeholder="Paper URL"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-card px-6 py-3 text-slate-700 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 glass-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}