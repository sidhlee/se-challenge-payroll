const mongoose = require('mongoose');

const timeReportSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('TimeReport', timeReportSchema);
