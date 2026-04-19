import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get('/complaints');
      // Filter for current tenant
      setComplaints(data.filter(c => c.userId === user._id));
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/complaints', {
        ...formData,
        userId: user._id,
        name: user.name
      });
      toast.success('Complaint submitted successfully');
      setIsModalOpen(false);
      setFormData({ subject: '', message: '' });
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to submit complaint');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <AlertCircle className="w-4 h-4 text-white/40" />;
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Complaints</h1>
          <p className="text-white/60">Raise an issue or track existing ones.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Complaint
        </button>
      </header>

      <div className="grid gap-6">
        {complaints.length > 0 ? complaints.map((c, idx) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${
                  c.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 
                  c.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-white/40'
                }`}>
                  {getStatusIcon(c.status)} {c.status}
                </span>
                <span className="text-white/20 text-xs font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{c.subject}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{c.message}</p>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-20 glass-card">
            <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No complaints raised yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">New Complaint</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase ml-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input-premium h-12"
                    placeholder="e.g. WiFi not working"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase ml-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="input-premium py-3 min-h-[150px] resize-none"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>
                <button type="submit" className="btn-premium w-full h-12 flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" /> Submit Issue
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Complaints;
