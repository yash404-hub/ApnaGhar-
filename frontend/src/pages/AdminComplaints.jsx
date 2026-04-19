import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get('/complaints');
      setComplaints(data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/complaints/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Manage Complaints</h1>
        <p className="text-white/60">Respond to tenant issues and track resolutions.</p>
      </div>

      <div className="grid gap-6">
        {complaints.length > 0 ? complaints.map((c, idx) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3 h-3" /> {c.name}
                  </div>
                  <span className="text-white/20 text-xs font-mono">{new Date(c.createdAt).toLocaleString()}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    c.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 
                    c.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-white/40'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{c.subject}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{c.message}</p>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-col gap-2 min-w-[150px]">
                <button 
                  onClick={() => updateStatus(c._id, 'In Progress')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 text-xs font-bold hover:bg-yellow-500/20 transition-all"
                >
                  <Clock className="w-4 h-4" /> Set In Progress
                </button>
                <button 
                  onClick={() => updateStatus(c._id, 'Resolved')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Resolved
                </button>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-20 glass-card">
            <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No complaints found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
