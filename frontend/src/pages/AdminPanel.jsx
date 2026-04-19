import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Trash2, Edit, CheckCircle, XCircle, 
  X, Phone, Lock, Hash, Calendar, Briefcase, User as UserIcon, 
  PlusCircle, CreditCard, Wifi, Shield, ShieldOff, Trophy, Settings, Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Earnings Stats
  const [stats, setStats] = useState({ total: 0, monthly: 0 });

  // Config State
  const [config, setConfig] = useState({ ownerContact: '', emergencyContact: '' });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', age: '', aadhaarNumber: '', 
    roomNumber: '', rentAmount: '', fatherName: '', motherName: '', 
    emergencyContact: '', reasonForStay: '', joiningDate: new Date().toISOString().split('T')[0],
    aadhaarImage: ''
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amount: '',
    month: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTenants();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await API.get('/config');
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config');
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/config', config);
      setConfig(data.config);
      toast.success('Contact details updated');
      setIsConfigModalOpen(false);
      fetchConfig(); // Refresh to be sure
    } catch (error) {
      toast.error('Failed to update contact details');
    }
  };

  const fetchTenants = async () => {
    try {
      const { data } = await API.get('/tenants');
      setTenants(data);
      
      // Calculate Stats
      let total = 0;
      let monthly = 0;
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      
      data.forEach(t => {
        t.paymentHistory?.forEach(p => {
          total += p.amount;
          if (p.month === currentMonth) {
            monthly += p.amount;
          }
        });
      });
      setStats({ total, monthly });
    } catch (error) {
      toast.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tenant = null) => {
    if (tenant) {
      setIsEditing(true);
      setCurrentTenant(tenant);
      setFormData({
        name: tenant.user?.name || '',
        phone: tenant.user?.phone || '',
        password: '', 
        age: tenant.age || '',
        aadhaarNumber: tenant.aadhaarNumber || '',
        roomNumber: tenant.roomNumber || '',
        rentAmount: tenant.rentAmount || '',
        fatherName: tenant.fatherName || '',
        motherName: tenant.motherName || '',
        emergencyContact: tenant.emergencyContact || '',
        reasonForStay: tenant.reasonForStay || '',
        joiningDate: tenant.joiningDate ? new Date(tenant.joiningDate).toISOString().split('T')[0] : '',
        aadhaarImage: tenant.aadhaarImage || ''
      });
    } else {
      setIsEditing(false);
      setFormData({
        name: '', phone: '', password: '', age: '', aadhaarNumber: '', 
        roomNumber: '', rentAmount: '', fatherName: '', motherName: '', 
        emergencyContact: '', reasonForStay: '', joiningDate: new Date().toISOString().split('T')[0],
        aadhaarImage: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenPaymentModal = (tenant) => {
    setCurrentTenant(tenant);
    setPaymentData({
      amount: tenant.rentAmount,
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      date: new Date().toISOString().split('T')[0]
    });
    setIsPaymentModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditing ? 'Updating tenant...' : 'Adding tenant...');
    try {
      if (isEditing) {
        await API.put(`/tenants/${currentTenant._id}`, formData);
        toast.success('Tenant updated successfully', { id: loadingToast });
      } else {
        // First create user
        const { data: userData } = await API.post('/auth/register', {
          name: formData.name,
          phone: formData.phone,
          password: formData.password || 'tenant123',
          role: 'TENANT'
        });

        // Then create tenant profile
        await API.post('/tenants', {
          ...formData,
          userId: userData._id
        });
        toast.success('Tenant added successfully', { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchTenants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed', { id: loadingToast });
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/tenants/${currentTenant._id}`, {
        payment: { ...paymentData, status: 'Paid' },
        rentPaidStatus: 'Paid'
      });
      toast.success('Payment recorded successfully');
      setIsPaymentModalOpen(false);
      fetchTenants();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await API.delete(`/tenants/${id}`);
        toast.success('Tenant deleted');
        fetchTenants();
      } catch (error) {
        toast.error('Failed to delete tenant');
      }
    }
  };

  const toggleWifi = async (tenant) => {
    try {
      await API.put(`/tenants/${tenant._id}`, { wifiEnabled: !tenant.wifiEnabled });
      toast.success(`WiFi ${!tenant.wifiEnabled ? 'enabled' : 'disabled'} for ${tenant.user?.name}`);
      fetchTenants();
    } catch (error) {
      toast.error('Failed to toggle WiFi');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.roomNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Owner Panel</h1>
          <p className="text-white/60">Manage your tenants and property</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-10 w-full md:w-64 text-sm"
            />
          </div>
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="p-2 rounded-full glass border border-white/20 text-white/60 hover:text-white transition-all"
            title="Contact Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-premium flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Tenant
          </button>
        </div>
      </header>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 bg-gradient-to-br from-green-500/10 to-blue-500/10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-green-500/20 text-green-400">
              <Banknote className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Monthly Earning</p>
              <h2 className="text-4xl font-black text-white">₹{stats.monthly}</h2>
            </div>
          </div>
          <p className="text-white/20 text-xs font-medium">Total collected for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Lifetime Revenue</p>
              <h2 className="text-4xl font-black text-white">₹{stats.total}</h2>
            </div>
          </div>
          <p className="text-white/20 text-xs font-medium">Total revenue generated from all properties</p>
        </motion.div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider text-center">Age</th>
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider">Room & Rent</th>
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider text-center">Docs</th>
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider">WiFi</th>
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-white/60 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/10">
                        {tenant.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tenant.user?.name}</p>
                        <p className="text-white/40 text-xs">{tenant.user?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-white font-medium">{tenant.age || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono text-xs">
                        {tenant.roomNumber}
                      </span>
                      <p className="text-white/60 text-sm font-medium">₹{tenant.rentAmount}</p>
                      {tenant.paymentHistory?.length > 0 && (
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter">
                          Last: ₹{tenant.paymentHistory[tenant.paymentHistory.length - 1].amount}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {tenant.aadhaarImage ? (
                      <button 
                        onClick={() => window.open(tenant.aadhaarImage, '_blank')}
                        className="inline-flex p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">View</span>
                      </button>
                    ) : (
                      <span className="text-white/20 text-[10px] font-bold uppercase">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleWifi(tenant)}
                      className={`p-2 rounded-lg transition-all ${
                        tenant.wifiEnabled 
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                          : 'bg-white/5 text-white/20 hover:bg-white/10'
                      }`}
                      title={tenant.wifiEnabled ? "Disable WiFi" : "Enable WiFi"}
                    >
                      {tenant.wifiEnabled ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        tenant.rentPaidStatus === 'Paid' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {tenant.rentPaidStatus === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {tenant.rentPaidStatus}
                      </span>
                      <button 
                        onClick={() => handleOpenPaymentModal(tenant)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-bold uppercase tracking-widest text-left"
                      >
                        Record Payment
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(tenant)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tenant._id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-white/20">
                      <Users className="w-16 h-16" />
                      <p className="text-xl font-medium">No tenants found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tenant Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {isEditing ? 'Edit Tenant' : 'New Tenant'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Personal Details</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input-premium pl-10 h-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="input-premium pl-10 h-12"
                        required
                      />
                    </div>
                    {!isEditing && (
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                        <input
                          type="password"
                          placeholder="Login Password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="input-premium pl-10 h-12"
                          required
                        />
                      </div>
                    )}
                    <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                    <input
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="input-premium pl-10 h-12"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Aadhaar Number"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                      className="input-premium pl-10 h-12"
                      required
                    />
                  </div>
                  <div className="relative">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-white/40 font-bold uppercase ml-1">Aadhaar Card Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({...formData, aadhaarImage: reader.result});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="input-premium py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">Rental Info</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <PlusCircle className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Room Number"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                        className="input-premium pl-10 h-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                      <input
                        type="number"
                        placeholder="Monthly Rent Amount"
                        value={formData.rentAmount}
                        onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                        className="input-premium pl-10 h-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                      <input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                        className="input-premium pl-10 h-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Reason for stay"
                        value={formData.reasonForStay}
                        onChange={(e) => setFormData({...formData, reasonForStay: e.target.value})}
                        className="input-premium pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-xs font-bold text-pink-400 uppercase tracking-[0.2em]">Emergency Contact Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Father's Name"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                      className="input-premium h-12"
                    />
                    <input
                      type="text"
                      placeholder="Mother's Name"
                      value={formData.motherName}
                      onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                      className="input-premium h-12"
                    />
                    <input
                      type="text"
                      placeholder="Emergency Contact Number"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      className="input-premium h-12 md:col-span-2"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="btn-premium w-full h-14 text-lg">
                    {isEditing ? 'Update Profile' : 'Register Tenant'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Record Payment</h2>
                  <p className="text-white/40 text-sm">{currentTenant?.user?.name} • Room {currentTenant?.roomNumber}</p>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Rent Amount</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      className="input-premium pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Payment Month</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="e.g. May 2026"
                      value={paymentData.month}
                      onChange={(e) => setPaymentData({...paymentData, month: e.target.value})}
                      className="input-premium pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                    className="input-premium h-12"
                    required
                  />
                </div>

                <button type="submit" className="btn-premium w-full h-14 mt-4">
                  Confirm Payment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Config Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Contact Settings</h2>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateConfig} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Owner Contact (WhatsApp/Call)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      value={config.ownerContact}
                      onChange={(e) => setConfig({...config, ownerContact: e.target.value})}
                      className="input-premium pl-10 h-12"
                      placeholder="e.g. 9099113546"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-1">Emergency Contact</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      value={config.emergencyContact}
                      onChange={(e) => setConfig({...config, emergencyContact: e.target.value})}
                      className="input-premium pl-10 h-12"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-premium w-full h-14 mt-4">
                  Save Contact Details
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
