const { parseFile } = require('fast-csv');
const fs = require('fs');
const moment = require('moment');

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

const createPayrollReport = (req, res, next) => {
  console.log('post');

  const workingHours = [];
  // treat first row as header and remove
  parseFile(req.file.path, { headers: true })
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
      };

      workingHours.push(workingHour);
    })
    .on('end', (rowCount) => {
      console.log(`Parsed ${rowCount} rows`);
      console.log(workingHours);
      fs.unlinkSync(req.file.path);
      return res.json(workingHours);
    });
};

module.exports = {
  getPayrollReport,
  createPayrollReport,
};
