const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Paid', 'Not Paid'],
    default: 'Paid',
  },
  month: String,
});

const tenantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  age: Number,
  aadhaarNumber: {
    type: String,
    required: true,
  },
  aadhaarImage: {
    type: String, // Cloudinary URL
  },
  fatherName: String,
  motherName: String,
  emergencyContact: String,
  roomNumber: {
    type: String,
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  rentPaidStatus: {
    type: String,
    enum: ['Paid', 'Not Paid'],
    default: 'Not Paid',
  },
  paymentHistory: [paymentHistorySchema],
  reasonForStay: String,
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  wifiEnabled: {
    type: Boolean,
    default: false,
  },
  wifiDetails: {
    name: { type: String, default: 'ApnaGhar_WiFi' },
    password: { type: String, default: 'apnaghar@123' },
  }
}, {
  timestamps: true,
});

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;
