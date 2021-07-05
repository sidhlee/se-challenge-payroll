const express = require('express');
const {
  getPayrollReport,
  createPayrollReport,
} = require('../controllers/payroll-controllers');

const router = express.Router();

router.get('/', getPayrollReport);

router.post('/', createPayrollReport);

module.exports = router;
