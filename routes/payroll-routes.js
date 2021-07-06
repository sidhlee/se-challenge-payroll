const express = require('express');
const fileUpload = require('../middlewares/file-upload');
const { createReport, getReport } = require('../controllers/payroll');

const router = express.Router();

router.get('/', getReport);

router.post('/', fileUpload.single('file'), createReport);

module.exports = router;
