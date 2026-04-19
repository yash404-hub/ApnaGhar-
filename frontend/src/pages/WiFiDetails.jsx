import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Wifi, Eye, EyeOff, Copy, ShieldCheck, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const WiFiDetails = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/tenants/profile');
        setProfile(data);
      } catch (error) {
        toast.error('Failed to fetch WiFi details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  if (loading) return <div className="text-white text-center py-20">Loading WiFi Details...</div>;

  if (!profile?.wifiEnabled) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/20"
        >
          <Wifi className="w-12 h-12" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">WiFi Access Restricted</h1>
          <p className="text-white/60 max-w-md mx-auto">
            WiFi is currently not enabled for your profile. Please contact the owner to request access.
          </p>
        </div>
        <button className="btn-premium">Contact Owner</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center text-blue-400 mb-6"
        >
          <Wifi className="w-10 h-10" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-2">WiFi Access</h1>
        <p className="text-white/60">Your private high-speed connection</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6">
          <ShieldCheck className="w-6 h-6 text-green-400/40" />
        </div>

        <div className="space-y-2">
          <label className="text-white/40 text-xs uppercase tracking-widest font-bold">Network Name (SSID)</label>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group">
            <div className="flex items-center gap-4">
              <Globe className="w-6 h-6 text-blue-400" />
              <p className="text-2xl font-bold text-white">{profile.wifiDetails?.name || 'ApnaGhar_WiFi'}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(profile.wifiDetails?.name || 'ApnaGhar_WiFi', 'Network name')}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white/40 text-xs uppercase tracking-widest font-bold">Password</label>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Eye className="w-5 h-5" />
              </div>
              <p className="text-2xl font-mono font-bold text-white tracking-wider">
                {showPassword ? (profile.wifiDetails?.password || 'apnaghar@123') : '••••••••••••'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => copyToClipboard(profile.wifiDetails?.password || 'apnaghar@123', 'Password')}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/5 text-blue-400/60 text-sm italic">
            <p>Note: Please do not share these credentials with anyone outside the property.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WiFiDetails;
