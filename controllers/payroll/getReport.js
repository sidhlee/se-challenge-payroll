const groupBy = require('lodash.groupby');
const moment = require('moment');
const { WorkingHour } = require('../../models');

const getReport = async (req, res, next) => {
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

module.exports = {
  getReport,
  getEmployeeReports,
  getPayPeriod,
  getPeriodicReport,
};
