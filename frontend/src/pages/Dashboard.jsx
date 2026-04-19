import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Wifi, CreditCard, ChevronRight, MessageSquare, Phone, Send, AlertTriangle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({ ownerContact: '', emergencyContact: '' });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, configRes] = await Promise.all([
          API.get('/tenants/profile').catch(err => {
            console.error('Profile fetch error:', err);
            return { data: null };
          }),
          API.get('/config').catch(err => {
            console.error('Config fetch error:', err);
            return { data: { ownerContact: '', emergencyContact: '' } };
          })
        ]);
        
        if (profileRes.data) {
          setProfile(profileRes.data);
        } else if (user.role === 'TENANT') {
          toast.error('Tenant profile not found. Please contact admin.');
        }
        
        if (configRes.data) {
          setConfig(configRes.data);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I'm ${user.name} from Room ${profile?.roomNumber}. I need to discuss something regarding my stay.`);
    window.open(`https://wa.me/91${config.ownerContact}?text=${message}`, '_blank');
  };

  const makeCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  if (loading) return <div className="text-white text-center py-20">Loading Dashboard...</div>;

  const cards = [
    { 
      title: 'Rent Status', 
      value: profile?.rentPaidStatus || 'Not Paid', 
      icon: CreditCard, 
      color: profile?.rentPaidStatus === 'Paid' ? 'text-green-400' : 'text-red-400',
      path: '/rent'
    },
    { 
      title: 'Room Number', 
      value: profile?.roomNumber || 'N/A', 
      icon: Home, 
      color: 'text-blue-400',
      path: '/profile'
    },
    { 
      title: 'WiFi Info', 
      value: profile?.wifiEnabled ? 'Active' : 'Inactive', 
      icon: Wifi, 
      color: profile?.wifiEnabled ? 'text-purple-400' : 'text-white/40',
      path: '/speed-test'
    },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Welcome, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-white/60 text-lg">Here's what's happening with your stay at ApnaGhar.</p>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          {profile?.rentPaidStatus === 'Not Paid' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-bold flex items-center gap-2 animate-bounce"
            >
              <CreditCard className="w-4 h-4" />
              Rent Due!
              {profile?.fine > 0 && <span> (Fine: ₹{profile.fine})</span>}
            </motion.div>
          )}
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/pay-rent')}
            className="btn-premium flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <CreditCard className="w-5 h-5" />
            Pay Rent
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/speed-test')}
            className="btn-premium flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Wifi className="w-5 h-5" />
            Check Speed
          </motion.button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            
            <div className="mt-8">
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">{card.title}</p>
              <h3 className={`text-3xl font-bold ${card.color}`}>{card.value}</h3>
            </div>

            <Link to={card.path} className="absolute inset-0 z-10" />
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">View All</button>
          </div>
          
          <div className="space-y-6">
            {profile?.paymentHistory?.length > 0 ? (
              profile.paymentHistory.slice(0, 3).map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Rent Payment - {payment.month}</p>
                      <p className="text-white/40 text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-white font-bold">₹{payment.amount}</p>
                </div>
              ))
            ) : (
              <p className="text-white/40 text-center py-10">No recent payments recorded.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 flex flex-col justify-center items-center text-center space-y-6"
        >
          <div className="p-6 rounded-full bg-red-500/20 text-red-400">
            <MessageSquare className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Have an Issue?</h2>
            <p className="text-white/60">Raise a complaint and our team will resolve it as soon as possible.</p>
          </div>
          <Link to="/complaints" className="btn-premium bg-gradient-to-r from-red-600 to-pink-600">
            Raise Complaint
          </Link>
        </motion.div>
      </section>

      {/* Contact Owner Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsContactModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white tracking-tight">Contact Owner</h2>
                <button onClick={() => setIsContactModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Property Owner</p>
                      <p className="text-xl font-bold text-white">Yash Kumar Gupta</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => makeCall(config.ownerContact)}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
                    >
                      <Phone className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Call Now</span>
                    </button>
                    <button 
                      onClick={openWhatsApp}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all group"
                    >
                      <Send className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-green-400 uppercase tracking-widest">WhatsApp</span>
                    </button>
                  </div>
                </div>

                {config.emergencyContact && (
                  <button 
                    onClick={() => makeCall(config.emergencyContact)}
                    className="w-full p-6 rounded-3xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-red-400/60 text-[10px] font-bold uppercase tracking-widest">Emergency Only</p>
                        <p className="text-xl font-bold text-red-400">Call Emergency</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-red-400/40 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              <div className="text-center">
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">Available 24/7 for urgent issues</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
