require('dotenv').config();
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const payrollRouter = require('./routes/payroll-routes');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

app.use('/api/payroll', payrollRouter);

app.use(async (err, req, res, next) => {
  console.log(err);

  // If header is already sent, skip to the next middleware (don't sent response again)
  if (res.headerSent) {
    return next(err);
  }

  if (req.file && req.file.path) {
    // remove temp file on error
    fs.unlink(req.file.path, () => {
      console.log('temporary file deleted due to error thrown.');
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'An unknown error occurred.',
  });
});

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (mongoError) => {
    if (mongoError) {
      console.log('Error connecting to mongoDB...');
      console.log(mongoError);
    }
    console.log('connected to db...');
    app.listen(PORT, () => {
      console.log(`Listening to port: ${PORT}`);
    });
  }
);
