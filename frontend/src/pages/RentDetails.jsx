import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Calendar, Download, Zap, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const RentDetails = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/tenants/profile');
        setProfile(data);
      } catch (error) {
        toast.error('Failed to fetch rent details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Loading Rent Details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Rent Details</h1>
          <p className="text-white/60">View your payment history and current status</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl glass ${
          profile?.rentPaidStatus === 'Paid' ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'
        }`}>
          {profile?.rentPaidStatus === 'Paid' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          <span className="text-xl font-bold uppercase tracking-wider">{profile?.rentPaidStatus}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-card p-8">
          <p className="text-white/40 text-sm font-medium uppercase mb-2">Monthly Rent</p>
          <h2 className="text-4xl font-bold text-white">₹{profile?.rentAmount}</h2>
        </div>
        <div className="glass-card p-8">
          <p className="text-white/40 text-sm font-medium uppercase mb-2">Room Number</p>
          <h2 className="text-4xl font-bold text-white">{profile?.roomNumber}</h2>
        </div>
        <div className="glass-card p-8">
          <p className="text-white/40 text-sm font-medium uppercase mb-2">Last Payment</p>
          <h2 className="text-2xl font-bold text-white">
            {profile?.paymentHistory?.length > 0 
              ? new Date(profile.paymentHistory[profile.paymentHistory.length - 1].date).toLocaleDateString()
              : 'None'}
          </h2>
        </div>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Payment History</h2>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
        
        <div className="divide-y divide-white/5">
          {profile?.paymentHistory?.length > 0 ? (
            profile.paymentHistory.map((payment, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl ${payment.lightBill ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                    {payment.lightBill ? <Zap className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Rent for {payment.month}</p>
                    <div className="flex flex-wrap items-center gap-3 text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                      {payment.units && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {payment.units} Units
                        </span>
                      )}
                      {payment.meterPhoto && (
                        <button 
                          onClick={() => setSelectedPhoto(payment.meterPhoto)}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <Camera className="w-3 h-3" />
                          View Proof
                        </button>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">
                        {payment.type || 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">₹{payment.amount}</p>
                  <div className="flex flex-col items-end">
                    {payment.lightBill > 0 && (
                      <p className="text-white/40 text-[10px]">Rent: ₹{payment.rentAmount} + Light: ₹{payment.lightBill}</p>
                    )}
                    {payment.fine > 0 && (
                      <p className="text-red-400/60 text-[10px] font-bold">Includes Fine: ₹{payment.fine}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/20">
                <CreditCard className="w-8 h-8" />
              </div>
              <p className="text-white/40">No payment history found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setSelectedPhoto(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl w-full max-h-[90vh] glass p-2"
          >
            <img src={selectedPhoto} alt="Proof" className="w-full h-full object-contain rounded-xl" />
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RentDetails;
