const fs = require('fs');
const mongoose = require('mongoose');
const { parseFile } = require('fast-csv');
const moment = require('moment');
const { HttpError, TimeReport, WorkingHour } = require('../../models');

const createReport = async (req, res, next) => {
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
      return next(
        new HttpError(
          `Uploading exiting report is not allowed. reportId: ${reportId}`,
          403
        )
      );
    }
  } catch (err) {
    return next(
      new HttpError('An error occurred while checking for existing report', 500)
    );
  }

  // Parse CSV then save into db
  const workingHours = [];
  // treat first row as header and remove
  return parseFile(req.file.path, { headers: true })
    .on('error', (err) => {
      console.error(err);
      return next(new Error('An error occurred while parsing CSV file.'));
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
        return next(new HttpError('Could not create payroll report', 500));
      }
    });
};

function getReportId(filename) {
  const idString = filename.match(/time-report-(\d+).csv/)[1];
  return parseInt(idString, 10);
}

module.exports = {
  createReport,
  getReportId,
};
