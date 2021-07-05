require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const payrollRouter = require('./routes/payroll-routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/api/payroll', payrollRouter);

app.get('/', (req, res, next) => {
  return res.status(200).json({ message: 'Hello!' });
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
