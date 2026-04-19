const express = require('express');
const {
  getTenants,
  getTenantProfile,
  createTenant,
  updateTenant,
  deleteTenant,
  submitPayment
} = require('../controllers/tenantController');
const { protect, ownerOnly } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(protect, ownerOnly, getTenants)
  .post(protect, ownerOnly, createTenant);

router.get('/profile', protect, getTenantProfile);
router.post('/pay-rent', protect, submitPayment);

router.route('/:id')
  .put(protect, ownerOnly, updateTenant)
  .delete(protect, ownerOnly, deleteTenant);

module.exports = router;
