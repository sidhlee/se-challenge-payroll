const { parseFile } = require('fast-csv');
const fs = require('fs');
const mongoose = require('mongoose');
const moment = require('moment');
const groupBy = require('lodash.groupby');
const HttpError = require('../models/httpError');
const TimeReport = require('../models/timeReport');
const WorkingHour = require('../models/workingHour');

const getPayrollReport = async (req, res, next) => {
  const sort = {
    employeeId: 1,
    date: 1,
  };

  const sortedWorkingHours = await WorkingHour.find({}).sort(sort);

  const employeeReports = getEmployeeReports(sortedWorkingHours);

  return res.json({
    payrollReport: {
      employeeReports,
    },
  });
};

function getEmployeeReports(workingHours) {
  const hoursWithPayPeriod = workingHours.map((workingHour) => {
    const { employeeId, date, hoursWorked, jobGroup } = workingHour;
    const payPeriod = getPayPeriod(date);
    const rate = jobGroup === 'B' ? 30 : 20;
    const amountInNumber = rate * hoursWorked;

    return { employeeId, payPeriod, amountInNumber };
  });

  const hoursByEmployeeObj = groupBy(
    hoursWithPayPeriod,
    (hour) => hour.employeeId
  );

  const hoursByEmployee = Object.values(hoursByEmployeeObj);

  const hoursByPeriodObjs = hoursByEmployee.map((hours) => {
    return groupBy(hours, (hour) => hour.payPeriod.startDate);
  });
  const result = hoursByPeriodObjs.reduce((arr, hoursByPeriodObj) => {
    const sumedPerPeriod =
      Object.values(hoursByPeriodObj).map(getPeriodicReport);
    arr = [...arr, ...sumedPerPeriod];
    return arr;
  }, []);

  return result;
}

function getPeriodicReport(arr) {
  const sumPay = arr.reduce((acc, val) => {
    const sum = acc + val.amountInNumber;
    return sum;
  }, 0);

  const { employeeId, payPeriod } = arr[0];
  return {
    employeeId: employeeId.toString(),
    payPeriod,
    amountPaid: `$${sumPay.toFixed(2)}`,
  };
}

/**
 *
 * @param {string} dateString format: 2021-07-02
 */
function getPayPeriod(dateString) {
  const m = moment(dateString);
  const year = m.year();
  const month = (m.month() + 1).toString().padStart(2, '0'); // month returns 0-based month
  const day = m.date().toString().padStart(2, '0');
  const endOfMonth = m.endOf('month').date();
  const startDate = day <= 15 ? `${year}-${month}-01` : `${year}-${month}-16`;
  const endDate =
    day <= 15 ? `${year}-${month}-15` : `${year}-${month}-${endOfMonth}`;

  const payPeriod = {
    startDate,
    endDate,
  };

  return payPeriod;
}

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
  getEmployeeReports,
  getPayPeriod,
};
