const { getReportId } = require('../controllers/payroll/createReport');

describe('getReportId', () => {
  it('returns correct id given filename', () => {
    const filename = 'time-report-42.csv';
    expect(getReportId(filename)).toBe(42);
  });
});
