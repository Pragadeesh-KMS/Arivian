import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  X, User, Mail, Phone, Briefcase, GraduationCap, 
  Link as LinkIcon, FileText, Plus, Trash2, Save, 
  Copy, Check, Award, Target, BookOpen, Sparkles
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
      className="fixed inset-0 bg-gradient-to-br from-blue-50/90 via-purple-50/90 to-pink-50/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Research Profile</h2>
                <p className="text-indigo-100">Complete your academic profile to collaborate</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close profile modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-bold">{profileStatus.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${profileStatus.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  profileStatus.color === 'green' ? 'bg-emerald-400' :
                  profileStatus.color === 'yellow' ? 'bg-amber-400' : 'bg-rose-400'
                } shadow-lg`}
              />
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-5">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('username')}
                      type="text"
                      className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-rose-600">{errors.username.message}</p>
                  )}
                </div>
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 cursor-not-allowed opacity-80"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                {/* Profile ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Collaborator ID</label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={user?.id || ''}
                        readOnly
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 font-mono text-sm cursor-not-allowed"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user?.id)}
                      className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center"
                      title="Copy UUID"
                    >
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Share this ID with paper authors to get added as collaborator
                  </p>
                </div>
                
                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('contact_no')}
                      type="tel"
                      className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your contact number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-5">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Professional Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Profession</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('profession')}
                      type="text"
                      className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., PhD Student, Professor"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">University/Institution</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('university')}
                      type="text"
                      className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your institution"
                    />
                  </div>
                </div>
              </div>
              
              {/* Research Topics */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Research Interests</label>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Target className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        {...register(`topic${i+1}` as keyof FormData)}
                        type="text"
                        className="pl-9 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Topic ${i+1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Portfolio Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Portfolio/Website Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('portfolio_link')}
                    type="url"
                    className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
                {errors.portfolio_link && (
                  <p className="text-sm text-rose-600">{errors.portfolio_link.message}</p>
                )}
              </div>
            </div>

            {/* Research Papers Section */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Published Research Papers</h3>
                </div>
                <button
                  type="button"
                  onClick={addResearchPaper}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Paper</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {researchPapers.map((paper, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-700">Paper #{index + 1}</h4>
                      </div>
                      {researchPapers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResearchPaper(index)}
                          className="p-2 text-gray-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Paper Title</label>
                        <input
                          type="text"
                          value={paper.title}
                          onChange={(e) => updateResearchPaper(index, 'title', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter paper title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Paper URL</label>
                        <input
                          type="url"
                          value={paper.url}
                          onChange={(e) => updateResearchPaper(index, 'url', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://example.com/paper"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}