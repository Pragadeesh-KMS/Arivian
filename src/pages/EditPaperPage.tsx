import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, PenTool, Copy, Trash2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Header from '../components/Header';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  topic_tags: yup.string().required('Topic tags are required'),
  abstract: yup.string().required('Abstract is required'),
  motive: yup.string().required('Motive is required'),
  completion_percentage: yup.number().min(0).max(100).required(),
  collaborators_needed: yup.number().min(1).max(10).required('Number of collaborators is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function EditPaperPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [collaboratorUUIDs, setCollaboratorUUIDs] = useState<string[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const completionValue = watch('completion_percentage', 0);
  const collaboratorsNeeded = watch('collaborators_needed', 1);

  const fetchPaper = useCallback(async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Paper not found');
        navigate('/my-papers');
        return;
      }

      if (data.author_id !== user.id) {
        toast.error('You are not authorized to edit this paper');
        navigate('/my-papers');
        return;
      }

      setPaper(data);
      setValue('title', data.title);
      setValue('topic_tags', data.topic_tags.join(', '));
      setValue('abstract', data.abstract);
      setValue('motive', data.motive);
      setValue('completion_percentage', data.completion_percentage);
      setValue('collaborators_needed', data.collaborators_needed);
      
      const authorized = data.collaborators_authorized || [];
      setCollaboratorUUIDs([...authorized]);
    } catch (error) {
      toast.error('Failed to load paper');
      navigate('/my-papers');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, setValue]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  useEffect(() => {
    if (!paper) return;

    const updatedUUIDs = [...collaboratorUUIDs];
    
    if (collaboratorsNeeded > updatedUUIDs.length) {
      const diff = collaboratorsNeeded - updatedUUIDs.length;
      for (let i = 0; i < diff; i++) {
        updatedUUIDs.push('');
      }
    } else if (collaboratorsNeeded < updatedUUIDs.length) {
      let lastNonEmpty = updatedUUIDs.length - 1;
      while (lastNonEmpty >= 0 && updatedUUIDs[lastNonEmpty] === '') {
        lastNonEmpty--;
      }
      
      const newLength = Math.max(collaboratorsNeeded, lastNonEmpty + 1);
      if (newLength < updatedUUIDs.length) {
        updatedUUIDs.splice(newLength);
      }
    }

    setCollaboratorUUIDs(updatedUUIDs);
  }, [collaboratorsNeeded, paper]);

  const onSubmit = async (data: FormData) => {
    if (!paper || !user) return;
    
    setSaving(true);
    try {
      const topicTags = data.topic_tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const nonEmptyUUIDs = collaboratorUUIDs
        .slice(0, data.collaborators_needed)
        .filter(uuid => uuid.trim() !== '');
      
      const uniqueUUIDs = Array.from(new Set(nonEmptyUUIDs));
      if (nonEmptyUUIDs.length !== uniqueUUIDs.length) {
        toast.error('Duplicate UUIDs are not allowed');
        setSaving(false);
        return;
      }
      
      const existingUUIDs = paper.collaborators_authorized || [];
      const removedUUIDs = existingUUIDs.filter(uuid => !uniqueUUIDs.includes(uuid));
      
      if (removedUUIDs.length > 0) {
        const updatedCollaborators = paper.collaborators.filter(
          (id: string) => !removedUUIDs.includes(id)
        );
        
        await supabase
          .from('papers')
          .update({ collaborators: updatedCollaborators })
          .eq('id', paper.id);
      }
      
      const { error } = await supabase
        .from('papers')
        .update({
          title: data.title,
          topic_tags: topicTags,
          abstract: data.abstract,
          motive: data.motive,
          completion_percentage: data.completion_percentage,
          collaborators_needed: data.collaborators_needed,
          updated_at: new Date().toISOString(),
          collaborators_authorized: uniqueUUIDs,
        })
        .eq('id', paper.id);

      if (error) throw error;

      toast.success('Paper updated successfully!');
      navigate('/my-papers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update paper');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (!paper) return;
    try {
      await navigator.clipboard.writeText(paper.urn);
      toast.success('URN copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URN');
    }
  };

  const handleRemoveCollaborator = async (index: number) => {
    if (!paper) return;
    
    const uuidToRemove = collaboratorUUIDs[index];
    if (!uuidToRemove) {
      const newUUIDs = [...collaboratorUUIDs];
      newUUIDs[index] = '';
      setCollaboratorUUIDs(newUUIDs);
      setShowRemoveConfirm(null);
      return;
    }
    
    try {
      const updatedCollaborators = paper.collaborators.filter((id: string) => id !== uuidToRemove);
      
      const updatedAuthorized = (paper.collaborators_authorized || [])
        .filter((id: string) => id !== uuidToRemove);
      
      await supabase
        .from('papers')
        .update({
          collaborators: updatedCollaborators,
          collaborators_authorized: updatedAuthorized
        })
        .eq('id', paper.id);
      
      const newUUIDs = [...collaboratorUUIDs];
      newUUIDs[index] = '';
      setCollaboratorUUIDs(newUUIDs);
      
      setPaper({
        ...paper,
        collaborators: updatedCollaborators,
        collaborators_authorized: updatedAuthorized
      });
      
      toast.success('Collaborator removed successfully');
    } catch (error) {
      toast.error('Failed to remove collaborator');
    } finally {
      setShowRemoveConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Research Paper</h1>
              </div>
              <button
                onClick={() => navigate('/my-papers')}
                className="glass-card px-4 py-2 text-slate-700 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* URN Display */}
            {paper && (
              <div className="glass-card p-6 mb-8 bg-indigo-50/30 border border-indigo-200/50">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Paper Identifier</h3>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-indigo-200/50">
                  <code className="text-lg font-mono font-bold text-indigo-800 flex-1">
                    {paper.urn}
                  </code>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="glass-button py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                  Share this URN with collaborators to let them join your project
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="form-group">
                <label className="form-label">Abstract *</label>
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
                <label className="form-label">Motive *</label>
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
                  <label className="form-label">Collaborators Needed *</label>
                  <input
                    {...register('collaborators_needed')}
                    type="number"
                    min="1"
                    max="10"
                    className="glass-input w-full"
                    placeholder="Number of collaborators needed"
                  />
                  {errors.collaborators_needed && (
                    <p className="form-error">{errors.collaborators_needed.message}</p>
                  )}
                </div>
              </div>

              {/* Collaborator UUIDs Section */}
              <div className="form-group">
                <label className="form-label">Authorized Collaborator UUIDs</label>
                <p className="text-sm text-slate-600 mb-3">
                  Add the UUIDs of the collaborators you want to authorize. 
                  You need to provide {collaboratorsNeeded} UUIDs.
                </p>
                <div className="space-y-3">
                  {collaboratorUUIDs.map((uuid, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={uuid}
                          onChange={(e) => {
                            const newUUIDs = [...collaboratorUUIDs];
                            newUUIDs[index] = e.target.value;
                            setCollaboratorUUIDs(newUUIDs);
                          }}
                          className="glass-input pl-10 w-full"
                          placeholder={`Collaborator #${index+1} UUID`}
                        />
                      </div>
                      {uuid && (
                        <button
                          type="button"
                          onClick={() => setShowRemoveConfirm(index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove collaborator"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate('/my-papers')}
                  className="flex-1 glass-card px-6 py-3 text-slate-700 hover:text-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 glass-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Remove Collaborator Confirmation Modal */}
      {showRemoveConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Remove Collaborator</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to remove this collaborator? They will lose access to this paper immediately.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="glass-card px-4 py-2 text-slate-700 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveCollaborator(showRemoveConfirm)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}