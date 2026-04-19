import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { User, Phone, Hash, Home, Calendar, Briefcase, Users, Heart, PhoneCall, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const TenantProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ newPassword: '', confirmPassword: '' });

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      await API.post('/auth/change-password', { newPassword: passData.newPassword });
      toast.success('Password updated successfully');
      setShowPassModal(false);
      setPassData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Failed to update password');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/tenants/profile');
        setProfile(data);
      } catch (error) {
        toast.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Loading Profile...</div>;

  const sections = [
    {
      title: 'Personal Details',
      icon: User,
      color: 'text-blue-400',
      items: [
        { label: 'Full Name', value: profile?.user?.name, icon: User },
        { label: 'Age', value: profile?.age || 'N/A', icon: Heart },
        { label: 'Phone', value: profile?.user?.phone, icon: Phone },
        { label: 'Aadhaar Number', value: profile?.aadhaarNumber, icon: Hash },
      ]
    },
    {
      title: 'Rental Information',
      icon: Home,
      color: 'text-purple-400',
      items: [
        { label: 'Room Number', value: profile?.roomNumber, icon: Home },
        { label: 'Monthly Rent', value: `₹${profile?.rentAmount}`, icon: Hash },
        { label: 'Joining Date', value: new Date(profile?.joiningDate).toLocaleDateString(), icon: Calendar },
        { label: 'Reason for Stay', value: profile?.reasonForStay || 'N/A', icon: Briefcase },
      ]
    },
    {
      title: 'Family & Emergency',
      icon: Users,
      color: 'text-pink-400',
      items: [
        { label: "Father's Name", value: profile?.fatherName || 'N/A', icon: User },
        { label: "Mother's Name", value: profile?.motherName || 'N/A', icon: User },
        { label: 'Emergency Contact', value: profile?.emergencyContact || 'N/A', icon: PhoneCall },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
          {profile?.user?.name.charAt(0)}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">{profile?.user?.name}</h1>
        <p className="text-white/60">Tenant Profile • Room {profile?.roomNumber}</p>
        <button 
          onClick={() => setShowPassModal(true)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-full glass border border-white/20 text-white font-medium hover:bg-white/10 transition-all"
        >
          <Lock className="w-4 h-4" /> Change Password
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-8 ${idx === 2 ? 'md:col-span-2' : ''}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2 rounded-lg bg-white/5 ${section.color}`}>
                <section.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-white/40 text-xs uppercase tracking-wider font-bold">{item.label}</p>
                  <div className="flex items-center gap-2 text-white">
                    <item.icon className="w-4 h-4 text-white/20" />
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPassModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md glass p-8 space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto mb-4 flex items-center justify-center text-blue-400">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Update Password</h2>
              <p className="text-white/40 text-sm">Secure your account with a new password.</p>
            </div>

            <form onSubmit={handlePassChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase ml-1">New Password</label>
                <input
                  type="password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  className="input-premium h-12"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/60 text-xs font-bold uppercase ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  className="input-premium h-12"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn-premium w-full h-12 mt-4">
                Update Now
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TenantProfile;
