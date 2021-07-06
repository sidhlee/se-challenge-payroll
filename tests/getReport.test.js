const {
  getEmployeeReports,
  getPayPeriod,
} = require('../controllers/payroll/getReport');

describe('getEmployeeReports', () => {
  it('should return correct reports', () => {
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

    //  | date       | hours worked | employee id | job group |
    //  | ---------- | ------------ | ----------- | --------- |
    //  | 2020-01-04 | 10           | 1           | A         |
    //  | 2020-01-14 | 5            | 1           | A         |
    //  | 2020-01-20 | 3            | 2           | B         |
    //  | 2020-01-20 | 4            | 1           | A         |
    const sortedWorkingHours = [
      {
        reportId: 42,
        date: '2020-01-04',
        hoursWorked: 10,
        employeeId: 1,
        jobGroup: 'A',
      },
      {
        reportId: 42,
        date: '2020-01-14',
        hoursWorked: 5,
        employeeId: 1,
        jobGroup: 'A',
      },
      {
        reportId: 42,
        date: '2020-01-20',
        hoursWorked: 4,
        employeeId: 1,
        jobGroup: 'A',
      },
      {
        reportId: 42,
        date: '2020-01-20',
        hoursWorked: 3,
        employeeId: 2,
        jobGroup: 'B',
      },
    ];
    const result = getEmployeeReports(sortedWorkingHours);

    expect(result).toStrictEqual(expected);
  });
});

describe('getPayPeriods', () => {
  it('should return correct periods', () => {
    const expected = {
      startDate: '2020-01-16',
      endDate: '2020-01-31',
    };

    expect(getPayPeriod('2020-01-20')).toStrictEqual(expected);
  });
});
