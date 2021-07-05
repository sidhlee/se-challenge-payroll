const express = require('express');
const fileUpload = require('../middlewares/file-upload');
const {
  getPayrollReport,
  createPayrollReport,
} = require('../controllers/payroll-controllers');

const router = express.Router();

router.get('/', getPayrollReport);

router.post('/', fileUpload.single('file'), createPayrollReport);

module.exports = router;
