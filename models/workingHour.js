const mongoose = require('mongoose');

const workingHourSchema = mongoose.Schema({
  reportId: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  hoursWorked: {
    // the number of hours worked will always be greater than 0.
    type: Number,
    required: true,
  },
  employeeId: {
    type: Number,
    required: true,
  },
  jobGroup: {
    type: String,
    enum: ['A', 'B'],
  },
});

module.exports = mongoose.model('WorkingHour', workingHourSchema);
const expected = [
  {
    employeeId: '1',
    payPeriod: {
      startDate: '2020-01-01',
      endDate: '2020-01-15',
    },
    amountPaid: '$300.00',
  },
  {
    employeeId: '1',
    payPeriod: {
      startDate: '2020-01-16',
      endDate: '2020-01-31',
    },
    amountPaid: '$80.00',
  },
  {
    employeeId: '2',
    payPeriod: {
      startDate: '2020-01-16',
      endDate: '2020-01-31',
    },
    amountPaid: '$90.00',
  },
];
