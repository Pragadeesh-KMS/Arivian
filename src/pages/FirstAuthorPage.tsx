import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PenTool, Copy, Check } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  topic_tags: yup.string().required('Topic tags are required'),
  collaborators_needed: yup.number().min(1).max(10).required('Number of collaborators is required'),
  abstract: yup.string().required('Abstract is required'),
  motive: yup.string().required('Motive is required'),
  completion_percentage: yup.number().min(0).max(100).required(),
  template: yup.string().required('Template selection is required'),
  agreement: yup.boolean().oneOf([true], 'You must agree to the terms'),
  signature: yup.string().required('Signature is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function FirstAuthorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedURN, setGeneratedURN] = useState('');
  const [copied, setCopied] = useState(false);
  const { user, profile } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      completion_percentage: 0,
    },
  });

  const completionValue = watch('completion_percentage');

  const generateURN = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `URN${timestamp.slice(-6)}${random}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedURN);
      setCopied(true);
      toast.success('URN copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URN');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !profile) {
      toast.error('Please complete your profile first');
      return;
    }
  
    if (data.signature.toLowerCase() !== profile.username.toLowerCase()) {
      toast.error('Signature must match your profile name');
      return;
    }
  
    setLoading(true);
    try {
      const urn = generateURN();
      const topicTags = data.topic_tags.split(',').map(tag => tag.trim()).filter(Boolean);
  
      const { error } = await supabase
        .from('papers')
        .insert({
          urn,
          title: data.title,
          topic_tags: topicTags,
          abstract: data.abstract,
          motive: data.motive,
          completion_percentage: data.completion_percentage,
          template: data.template,
          collaborators_needed: data.collaborators_needed,
          author_id: user.id,
          is_public: isPublic,
          collaborators: [],
          collaborators_authorized: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
  
      if (error) throw error;
  
      setGeneratedURN(urn);
      toast.success('Paper created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create paper');
    }
    setLoading(false);
  };

  const templates = [
    { value: 'ieee', label: 'IEEE Conference' },
    { value: 'springer', label: 'Springer Journal' },
    { value: 'acm', label: 'ACM Proceedings' },
    { value: 'nature', label: 'Nature Journal' },
    { value: 'elsevier', label: 'Elsevier Journal' },
  ];

  return (
    <div className="min-h-screen">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Start a New Paper</h1>
              <p className="text-slate-600">Create your research project and generate a unique identifier</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Title of the Paper *</label>
                  <input
                    {...register('title')}
                    type="text"
                    className="glass-input w-full"
                    placeholder="Enter your paper title"
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Topic Tags *</label>
                  <input
                    {...register('topic_tags')}
                    type="text"
                    className="glass-input w-full"
                    placeholder="machine learning, AI, neural networks"
                  />
                  {errors.topic_tags && (
                    <p className="form-error">{errors.topic_tags.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Collaborators Needed (1-10) *</label>
                <input
                  {...register('collaborators_needed')}
                  type="number"
                  min="1"
                  max="10"
                  className="glass-input w-full"
                  placeholder="How many collaborators do you need?"
                />
                {errors.collaborators_needed && (
                  <p className="form-error">{errors.collaborators_needed.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Idea/Abstract *</label>
                <textarea
                  {...register('abstract')}
                  className="glass-input w-full h-32 resize-none"
                  placeholder="Describe your research idea and abstract..."
                />
                {errors.abstract && (
                  <p className="form-error">{errors.abstract.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Motive of the Paper *</label>
                <textarea
                  {...register('motive')}
                  className="glass-input w-full h-24 resize-none"
                  placeholder="What motivates this research? What problem are you solving?"
                />
                {errors.motive && (
                  <p className="form-error">{errors.motive.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">% of Completion</label>
                  <div className="space-y-2">
                    <input
                      {...register('completion_percentage')}
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-center">
                      <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                        {completionValue}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Paper Visibility</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="private"
                        name="visibility"
                        checked={!isPublic}
                        onChange={() => setIsPublic(false)}
                        className="hidden"
                      />
                      <label
                        htmlFor="private"
                        className={`px-4 py-2 rounded-l-lg cursor-pointer transition-colors ${
                          !isPublic
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Private
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="public"
                        name="visibility"
                        checked={isPublic}
                        onChange={() => setIsPublic(true)}
                        className="hidden"
                      />
                      <label
                        htmlFor="public"
                        className={`px-4 py-2 rounded-r-lg cursor-pointer transition-colors ${
                          isPublic
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Public
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {isPublic 
                      ? "Paper will appear in search results" 
                      : "Paper won't appear in public searches"}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Choose Template *</label>
                  <select
                    {...register('template')}
                    className="glass-input w-full"
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  {errors.template && (
                    <p className="form-error">{errors.template.message}</p>
                  )}
                </div>
              </div>

              {/* Agreement Section */}
              <div className="glass-card p-6 bg-amber-50/30">
                <div className="flex items-start gap-3">
                  <input
                    {...register('agreement')}
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm text-slate-700 leading-relaxed">
                    I hereby declare that the paper and title I have written and intend to publish is entirely new and based on my own original research. I confirm that this work does not infringe upon any existing copyrights, patents, or intellectual property rights. I understand that any violation of this agreement may result in the immediate termination of my account and potential legal consequences.
                  </label>
                </div>
                {errors.agreement && (
                  <p className="form-error mt-2">{errors.agreement.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Full Name (as signature) *</label>
                <input
                  {...register('signature')}
                  type="text"
                  className="glass-input w-full"
                  placeholder="Enter your full name exactly as in your profile"
                />
                {errors.signature && (
                  <p className="form-error">{errors.signature.message}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Must match your profile name</p>
              </div>

              {/* URN Display */}
              {generatedURN && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 bg-green-50/30 border-green-200/50"
                >
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Paper Created Successfully!</h3>
                  <p className="text-green-700 mb-3">Your unique paper identifier:</p>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-green-200/50">
                    <code className="text-lg font-mono font-bold text-green-800 flex-1">
                      {generatedURN}
                    </code>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="glass-button py-2 px-4 text-sm flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Share this URN with collaborators to let them join your project
                  </p>
                </motion.div>
              )}

              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={loading || !!generatedURN}
                  className="glass-button px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating URN....
                    </div>
                  ) : generatedURN ? (
                    'Paper Created'
                  ) : (
                    'Generate URN & Start Paper'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}