const mongoose = require('mongoose');

const workingHourSchema = mongoose.Schema({
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
