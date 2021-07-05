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
  return res.status(200).json({ payrollReport });
};

const createPayrollReport = (req, res, next) => {
  console.log('post');
  return res
    .status(200)
    .json({ message: 'Time report successfully uploaded!' });
};

module.exports = {
  getPayrollReport,
  createPayrollReport,
};
