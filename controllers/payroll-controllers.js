const { parseFile } = require('fast-csv');
const fs = require('fs');
const mongoose = require('mongoose');
const moment = require('moment');
const HttpError = require('../models/httpError');
const TimeReport = require('../models/timeReport');
const WorkingHour = require('../models/workingHour');

const getPayrollReport = (req, res, next) => {
  const payrollReport = {
    employeeReports: [
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
    ],
  };
  return res.json({ payrollReport });
};

const createPayrollReport = async (req, res, next) => {
  const reportId = getReportId(req.file.originalname);

  // read csv file into string and create new timeReport model
  const file = fs.readFileSync(req.file.path, 'utf8');
  const id = reportId;
  const timeReport = {
    id,
    file,
  };
  const newTimeReport = new TimeReport(timeReport);

  // Check for existing report
  try {
    const existingReport = await TimeReport.find({ id: reportId });

    if (existingReport.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        message: `Uploading exiting report is not allowed. reportId: ${reportId}`,
      });
    }
  } catch (err) {
    fs.unlinkSync(req.file.path);
    throw new HttpError(
      'An error occurred while checking for existing report',
      500
    );
  }

  // Parse CSV then save into db
  const workingHours = [];
  // treat first row as header and remove
  return parseFile(req.file.path, { headers: true })
    .on('error', (err) => {
      console.error(err);
      return res.status(500);
    })
    .on('data', (row) => {
      const {
        date,
        'hours worked': hoursWorked,
        'employee id': employeeId,
        'job group': jobGroup,
      } = row;

      const formattedDate = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

      const workingHour = {
        date: formattedDate,
        hoursWorked,
        employeeId,
        jobGroup,
        reportId,
      };
      workingHours.push(workingHour);
    })
    .on('end', async (rowCount) => {
      // insert workingHours and timeReport in one transaction
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await newTimeReport.save({ session });
        await WorkingHour.insertMany(workingHours, { session });
        await session.commitTransaction();

        // remove temp file on success
        fs.unlinkSync(req.file.path);

        return res.status(200).json({ success: true, rowCount, workingHours });
      } catch (err) {
        console.log(err);
        return next(new HttpError('Could not create payroll report', 500));
      }
    });
};

function getReportId(filename) {
  const idString = filename.match(/time-report-(\d+).csv/)[1];
  return parseInt(idString, 10);
}

module.exports = {
  getPayrollReport,
  createPayrollReport,
};
