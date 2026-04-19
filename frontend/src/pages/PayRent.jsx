import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { CreditCard, Camera, Zap, ArrowRight, CheckCircle, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PayRent = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState('');
  const [meterPhoto, setMeterPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const UNIT_RATE = 8;

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMeterPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const lightBill = units ? parseInt(units) * UNIT_RATE : 0;
  const fineAmount = profile?.fine || 0;
  const totalAmount = profile ? profile.rentAmount + lightBill + fineAmount : 0;

  const handlePayment = async () => {
    if (!units || !previewUrl) {
      toast.error('Please enter units and upload meter photo');
      return;
    }

    setSubmitting(true);
    try {
      // Official UPI Details
      const upiId = '9099113546@ybl';
      const name = 'Yash Kumar Gupta';
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR`;
      
      window.location.href = upiUrl;

      // Wait a bit to simulate payment completion then save to backend
      setTimeout(async () => {
        await API.post('/tenants/pay-rent', {
          units: parseInt(units),
          lightBill,
          fine: fineAmount,
          totalAmount,
          meterPhoto: previewUrl,
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        });
        toast.success('Rent Paid Successfully!');
        navigate('/rent');
      }, 2000);
    } catch (error) {
      toast.error('Payment failed');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Pay Your Rent</h1>
        <p className="text-white/60">Calculate and pay your monthly dues instantly.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 space-y-8"
      >
        {/* Step 1: Base Rent */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-500/20 text-green-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Base Rent</p>
              <p className="text-2xl font-bold text-white">₹{profile?.rentAmount}</p>
            </div>
          </div>
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>

        {/* Step 2: Electricity Bill */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold uppercase text-xs tracking-widest">Electricity Consumption</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-bold uppercase ml-1">Current Units</label>
              <input
                type="number"
                placeholder="Enter meter units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="input-premium h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-bold uppercase ml-1">Upload Meter Proof</label>
              <div className="relative h-12">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="input-premium flex items-center gap-2 h-full text-white/40 overflow-hidden">
                  <Camera className="w-4 h-4" />
                  <span className="truncate">{meterPhoto ? meterPhoto.name : 'Choose Photo'}</span>
                </div>
              </div>
            </div>
          </div>

          {previewUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video"
            >
              <img src={previewUrl} alt="Meter" className="w-full h-full object-cover" />
            </motion.div>
          )}

          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex justify-between items-center">
            <p className="text-purple-300/80 text-sm font-medium">Light Bill (Units × ₹8)</p>
            <p className="text-xl font-bold text-purple-400">₹{lightBill}</p>
          </div>

          {fineAmount > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex justify-between items-center animate-pulse">
              <div className="flex items-center gap-2">
                <p className="text-red-400 text-sm font-bold uppercase tracking-widest">Late Payment Fine</p>
                <span className="text-[10px] text-red-400/60 font-medium">(₹50/day after 5th)</span>
              </div>
              <p className="text-xl font-bold text-red-500">₹{fineAmount}</p>
            </div>
          )}
        </div>

        {/* Total & Pay */}
        <div className="pt-8 border-t border-white/10 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-1">Total Payable</p>
              <h2 className="text-5xl font-black text-white">₹{totalAmount}</h2>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">Inclusive of all charges</p>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={submitting}
            className="btn-premium w-full h-16 text-xl flex items-center justify-center gap-3"
          >
            {submitting ? 'Redirecting to UPI...' : (
              <>
                <CreditCard className="w-6 h-6" />
                Pay Now via UPI
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PayRent;
