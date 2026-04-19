const { db } = require('../config/db');

const calculateFine = (tenant) => {
  if (!tenant || tenant.rentPaidStatus === 'Paid') return 0;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Last payment month
  let lastPaidDate = tenant.joiningDate ? new Date(tenant.joiningDate) : new Date();
  if (tenant.paymentHistory && Array.isArray(tenant.paymentHistory) && tenant.paymentHistory.length > 0) {
    const lastPayment = tenant.paymentHistory[tenant.paymentHistory.length - 1];
    if (lastPayment.date) {
        lastPaidDate = new Date(lastPayment.date);
    }
  }

  // Calculate if the current month's rent is due
  const dueDate = new Date(currentYear, currentMonth, 1);
  const gracePeriodEnd = new Date(currentYear, currentMonth, 6); // 5 days grace

  if (today > gracePeriodEnd && (tenant.rentPaidStatus === 'Not Paid' || !tenant.rentPaidStatus)) {
    const diffTime = Math.abs(today - gracePeriodEnd);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 50;
  }

  return 0;
};

const getTenants = async (req, res) => {
  const tenants = db.get('tenants').value();
  const tenantsWithUsers = tenants.map(t => {
    const user = db.get('users').find({ _id: t.user }).value();
    const fine = calculateFine(t);
    return { ...t, user, fine };
  });
  res.json(tenantsWithUsers);
};

const getTenantProfile = async (req, res) => {
  const tenant = db.get('tenants').find({ user: req.user.id }).value();
  if (tenant) {
    const user = db.get('users').find({ _id: tenant.user }).value();
    const fine = calculateFine(tenant);
    res.json({ ...tenant, user, fine });
  } else {
    if (req.user.role === 'OWNER' && req.query.id) {
        const t = db.get('tenants').find({ _id: req.query.id }).value();
        const user = db.get('users').find({ _id: t.user }).value();
        const fine = calculateFine(t);
        return res.json({ ...t, user, fine });
    }
    res.status(404).json({ message: 'Tenant not found' });
  }
};

const createTenant = async (req, res) => {
  const { 
    userId, age, aadhaarNumber, roomNumber, rentAmount, 
    fatherName, motherName, emergencyContact, reasonForStay, joiningDate 
  } = req.body;

  const tenantExists = db.get('tenants').find({ user: userId }).value();

  if (tenantExists) {
    res.status(400).json({ message: 'Tenant profile already exists for this user' });
    return;
  }

  const newTenant = {
    _id: Math.random().toString(36).substr(2, 9),
    user: userId,
    age: parseInt(age),
    aadhaarNumber,
    roomNumber,
    rentAmount: parseInt(rentAmount),
    rentPaidStatus: 'Not Paid',
    paymentHistory: [],
    fatherName,
    motherName,
    emergencyContact,
    reasonForStay,
    joiningDate: joiningDate || new Date().toISOString(),
    wifiEnabled: false,
    wifiDetails: {
      name: 'ApnaGhar_WiFi',
      password: 'apnaghar@123'
    },
    createdAt: new Date().toISOString()
  };

  db.get('tenants').push(newTenant).write();
  res.status(201).json(newTenant);
};

const updateTenant = async (req, res) => {
  const { id } = req.params;
  const tenant = db.get('tenants').find({ _id: id }).value();

  if (tenant) {
    const updatedTenant = {
      ...tenant,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (req.body.payment) {
        updatedTenant.paymentHistory.push(req.body.payment);
    }

    db.get('tenants').find({ _id: id }).assign(updatedTenant).write();
    res.json(updatedTenant);
  } else {
    res.status(404).json({ message: 'Tenant not found' });
  }
};

const deleteTenant = async (req, res) => {
  const { id } = req.params;
  const tenant = db.get('tenants').find({ _id: id }).value();

  if (tenant) {
    db.get('users').remove({ _id: tenant.user }).write();
    db.get('tenants').remove({ _id: id }).write();
    res.json({ message: 'Tenant removed' });
  } else {
    res.status(404).json({ message: 'Tenant not found' });
  }
};

const submitPayment = async (req, res) => {
  const { units, totalAmount, lightBill, meterPhoto, month, fine } = req.body;
  const tenant = db.get('tenants').find({ user: req.user.id }).value();

  if (tenant) {
    const paymentRecord = {
      _id: Math.random().toString(36).substr(2, 9),
      amount: totalAmount,
      rentAmount: tenant.rentAmount,
      lightBill,
      fine: fine || 0,
      units,
      meterPhoto,
      month,
      date: new Date().toISOString(),
      status: 'Paid',
      type: 'Online'
    };

    const updatedHistory = [...(tenant.paymentHistory || []), paymentRecord];
    
    db.get('tenants')
      .find({ user: req.user.id })
      .assign({ 
        paymentHistory: updatedHistory,
        rentPaidStatus: 'Paid'
      })
      .write();

    res.json({ message: 'Payment recorded successfully', payment: paymentRecord });
  } else {
    res.status(404).json({ message: 'Tenant profile not found' });
  }
};

module.exports = {
  getTenants,
  getTenantProfile,
  createTenant,
  updateTenant,
  deleteTenant,
  submitPayment
};
