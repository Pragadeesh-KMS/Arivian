import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, Download, Users, FileText, Settings } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Logo from "../components/Logo";

export default function PaperEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [paper, setPaper] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isAuthor, setIsAuthor] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  const AI_ENABLED = false;

  const AIPlaceholder = () => (
    <div className="min-h-screen">
      <Header onMenuToggle={() => {}} showMenu={false} />
      <main className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card p-8 text-center">
              <div className="flex items-center gap-3">
                <Logo width="600" height="30" viewBox="-700 0 1500 120" />
              </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">AI-Powered Paper Editor Coming Soon!</h2>
            <p className="text-slate-600 mb-6">
              We are working hard to bring you an AI-enhanced paper editing experience. 
              This feature will help you write, edit, and collaborate on your research papers with advanced AI tools.
            </p>
            <p className="text-slate-600 mb-8">
              Until then, please use our free API search module to discover papers in your field of interest and our powerful search to enhance your research.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="glass-button px-6 py-3"
              >
                Explore Research Papers
              </button>
              <button
                onClick={() => navigate('/my-papers')}
                className="glass-card px-6 py-3 text-slate-700 hover:text-indigo-600 font-medium"
              >
                View My Papers
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );

  if (!AI_ENABLED) {
    return <AIPlaceholder />;
  }

  useEffect(() => {
    if (id) {
      fetchPaper();
    }
  }, [id, user]);

  const fetchPaper = async () => {
    if (!user) return;

    try {
      const { data: paperData, error: paperError } = await supabase
        .from('papers')
        .select('*')
        .eq('urn', id)
        .single();

      if (paperError || !paperData) {
        toast.error('Paper not found');
        navigate('/home');
        return;
      }

      const hasAccess = paperData.author_id === user.id || 
                       (paperData.collaborators && paperData.collaborators.includes(user.id));

      if (!hasAccess) {
        toast.error('You do not have access to this paper');
        navigate('/home');
        return;
      }

      setPaper(paperData);
      setContent(paperData.content || getDefaultContent(paperData));
      setIsAuthor(paperData.author_id === user.id);

      if (paperData.collaborators && paperData.collaborators.length > 0) {
        const { data: collabData } = await supabase
          .from('profiles')
          .select('id, username, email')
          .in('user_id', paperData.collaborators);
        
        if (collabData) {
          setCollaborators(collabData);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load paper');
      navigate('/home');
    }
    setLoading(false);
  };

  const getDefaultContent = (paperData: any) => {
    const template = getTemplateContent(paperData.template, paperData);
    return template;
  };

  const getTemplateContent = (template: string, paperData: any) => {
    const baseContent = `
      <h1>${paperData.title}</h1>
      
      <h2>Abstract</h2>
      <p>${paperData.abstract || 'Abstract content goes here...'}</p>
      
      <h2>1. Introduction</h2>
      <p>${paperData.motive || 'Introduction content goes here...'}</p>
      
      <h2>2. Literature Review</h2>
      <p>Literature review content goes here...</p>
      
      <h2>3. Methodology</h2>
      <p>Methodology content goes here...</p>
      
      <h2>4. Results</h2>
      <p>Results content goes here...</p>
      
      <h2>5. Discussion</h2>
      <p>Discussion content goes here...</p>
      
      <h2>6. Conclusion</h2>
      <p>Conclusion content goes here...</p>
      
      <h2>References</h2>
      <p>References go here...</p>
    `;

    return baseContent;
  };

  const handleSave = async () => {
    if (!isAuthor) {
      toast.error('Only the first author can save changes');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('papers')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paper.id);

      if (error) throw error;

      toast.success('Paper saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save paper');
    }
    setSaving(false);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${paper.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            p { line-height: 1.6; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
    
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Paper downloaded successfully!');
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
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
      <Header onMenuToggle={() => {}} showMenu={false} />
      
      <main className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Paper Header */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{paper?.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    URN: {paper?.urn}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {(collaborators.length || 0) + 1} members
                  </span>
                  <span>{paper?.completion_percentage}% complete</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="glass-card px-4 py-2 text-slate-700 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving || !isAuthor}
                  className="glass-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Paper Content</h2>
              {!isAuthor && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                  Read-only mode - Only first author can save changes
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Start writing your research paper..."
                style={{ minHeight: '500px' }}
                readOnly={!isAuthor}
              />
            </div>
          </div>

          {/* Collaborators Panel */}
          {collaborators.length > 0 && (
            <div className="glass-card p-6 mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Collaborators</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {collaborator.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{collaborator.username}</p>
                        <p className="text-sm text-slate-600">{collaborator.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}