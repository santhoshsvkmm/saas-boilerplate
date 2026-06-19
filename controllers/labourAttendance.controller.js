const db = require("../models");
const LabourAttendance = db.labourAttendance;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const moment = require('moment');
const { Parser } = require('json2csv');
const archiver = require('archiver');
const { clearCacheByTag } = require("../utils/cache.util");

// Clock in a labourer
exports.clockIn = catchAsync(async (req, res) => {
  const { labour_id, project_id } = req.body;

  // Verify the labourer is assigned to the project
  const assignment = await db.labour.findOne({
    where: { id: labour_id },
    include: [{
      model: db.task,
      required: true,
      attributes: ['id'],
      through: { attributes: [] },
      include: [{
        model: db.projectverison,
        required: true,
        attributes: [],
        where: { projectId: project_id }
      }]
    }]
  });

  if (!assignment) {
    return res.status(403).send({ message: 'This labourer is not assigned to any task in this project and cannot clock in.' });
  }

  // Check if the labourer is already clocked in
  const existingRecord = await LabourAttendance.findOne({
    where: { labour_id, status: 'clocked_in' }
  });

  if (existingRecord) {
    logger.warn(`Clock-in failed for labourer ID ${labour_id}: already clocked in.`);
    return res.status(409).send({ message: 'This labourer is already clocked in.' });
  }

  const attendance = await LabourAttendance.create({
    labour_id,
    project_id,
    clock_in_time: new Date(),
    status: 'clocked_in',
  });

  await clearCacheByTag(`project-clocked-in:${project_id}`);
  await clearCacheByTag(`labourer-projects:${labour_id}`);

  logger.info(`Labourer ID ${labour_id} clocked in successfully for project ID ${project_id}.`);
  res.status(201).send(attendance);
});

// Clock out a labourer
exports.clockOut = catchAsync(async (req, res) => {
  const { labour_id } = req.body;

  const attendanceRecord = await LabourAttendance.findOne({
    where: { labour_id, status: 'clocked_in' }
  });

  if (!attendanceRecord) {
    logger.warn(`Clock-out failed for labourer ID ${labour_id}: not clocked in.`);
    return res.status(404).send({ message: 'This labourer is not currently clocked in.' });
  }

  const clockOutTime = new Date();
  const clockInTime = moment(attendanceRecord.clock_in_time);
  const duration = moment(clockOutTime).diff(clockInTime, 'minutes');

  await attendanceRecord.update({
    clock_out_time: clockOutTime,
    duration_minutes: duration,
    status: 'clocked_out',
  });

  await clearCacheByTag(`labourer-project-hours:${labour_id}:${attendanceRecord.project_id}`);
  await clearCacheByTag(`project-clocked-in:${attendanceRecord.project_id}`);
  await clearCacheByTag(`project-hours-summary:${attendanceRecord.project_id}`);
  await clearCacheByTag(`project-hours-by-labourer:${attendanceRecord.project_id}`);

  logger.info(`Labourer ID ${labour_id} clocked out successfully. Duration: ${duration} minutes.`);
  res.status(200).send(attendanceRecord);
});

// Get attendance history for a specific labourer
exports.getHistory = catchAsync(async (req, res) => {
  const { labourerId } = req.params;
  const { startDate, endDate } = req.query;

  const whereClause = { labour_id: labourerId };

  if (startDate || endDate) {
    whereClause.clock_in_time = {};
    if (startDate) {
      whereClause.clock_in_time[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.clock_in_time[Op.lte] = new Date(endDate);
    }
  }

  logger.info(`Retrieving attendance history for labourer ID: ${labourerId}`);
  const history = await LabourAttendance.findAll({
    where: whereClause,
    include: [
      { model: db.project, attributes: ['id', 'projectName'] },
      { model: db.labour, attributes: ['id', 'first_name', 'last_name'] }
    ],
    order: [['clock_in_time', 'DESC']],
  });

  res.status(200).send(history);
});

// Get a summary of total hours worked by a labourer on a specific project
exports.getHoursSummaryForProject = catchAsync(async (req, res) => {
  const { labourerId, projectId } = req.params;

  const totalMinutes = await LabourAttendance.sum('duration_minutes', {
    where: {
      labour_id: labourerId,
      project_id: projectId,
      status: 'clocked_out'
    }
  });

  const totalHours = totalMinutes ? (totalMinutes / 60).toFixed(2) : 0;

  logger.info(`Retrieved total hours summary for labourer ID ${labourerId} on project ID ${projectId}: ${totalHours} hours.`);
  res.status(200).send({
    labourerId,
    projectId,
    totalHours: parseFloat(totalHours)
  });
});

// Get a breakdown of hours per labourer for a specific project
exports.getProjectHoursByLabourer = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  logger.info(`Retrieving hours breakdown by labourer for project ID: ${projectId}`);
  const summary = await LabourAttendance.findAll({
    attributes: [
      [db.sequelize.fn('SUM', db.sequelize.col('duration_minutes')), 'totalMinutes']
    ],
    where: {
      project_id: projectId,
      status: 'clocked_out'
    },
    group: ['labour.id'],
    include: [{
      model: db.labour,
      attributes: ['id', 'first_name', 'last_name', 'email']
    }],
  });

  const result = summary.map(item => ({
    totalHours: item.dataValues.totalMinutes ? (item.dataValues.totalMinutes / 60).toFixed(2) : "0.00",
    labour: item.labour
  }));

  res.status(200).send(result);
});

// Get a weekly timesheet summary for a labourer
exports.getWeeklyTimesheet = catchAsync(async (req, res) => {
  const { labourerId } = req.params;
  const { weekOf } = req.query;

  const startOfWeek = moment(weekOf).startOf('isoWeek').toDate();
  const endOfWeek = moment(weekOf).endOf('isoWeek').toDate();

  logger.info(`Retrieving weekly timesheet for labourer ID ${labourerId} for the week of ${moment(startOfWeek).format('YYYY-MM-DD')}`);

  const attendanceRecords = await LabourAttendance.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('clock_in_time')), 'work_date'],
      [db.sequelize.fn('SUM', db.sequelize.col('duration_minutes')), 'totalMinutes']
    ],
    where: {
      labour_id: labourerId,
      status: 'clocked_out',
      clock_in_time: {
        [Op.gte]: startOfWeek,
        [Op.lte]: endOfWeek,
      }
    },
    group: [db.sequelize.fn('DATE', db.sequelize.col('clock_in_time'))],
    order: [[db.sequelize.fn('DATE', db.sequelize.col('clock_in_time')), 'ASC']],
    raw: true,
  });

  const weeklySummary = attendanceRecords.map(record => ({
    date: record.work_date,
    totalHours: (record.totalMinutes / 60).toFixed(2),
  }));

  const grandTotalMinutes = weeklySummary.reduce((sum, day) => sum + (parseFloat(day.totalHours) * 60), 0);

  res.status(200).send({
    labourerId,
    weekOf: moment(startOfWeek).format('YYYY-MM-DD'),
    dailySummary: weeklySummary,
    weeklyTotalHours: (grandTotalMinutes / 60).toFixed(2),
  });
});

// Download attendance history for a specific labourer as CSV
exports.downloadHistory = catchAsync(async (req, res) => {
  const { labourerId } = req.params;
  const { startDate, endDate, password } = req.query;

  const whereClause = { labour_id: labourerId };

  if (startDate || endDate) {
    whereClause.clock_in_time = {};
    if (startDate) {
      whereClause.clock_in_time[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereClause.clock_in_time[Op.lte] = new Date(endDate);
    }
  }

  logger.info(`Generating attendance history CSV for labourer ID: ${labourerId}`);
  const history = await LabourAttendance.findAll({
    where: whereClause,
    include: [
      { model: db.project, attributes: ['projectName'] },
      { model: db.labour, attributes: ['first_name', 'last_name'] }
    ],
    order: [['clock_in_time', 'DESC']],
    raw: true,
    nest: true,
  });

  if (history.length === 0) {
    return res.status(404).send({ message: 'No attendance records found for the given criteria.' });
  }

  const fields = [
    { label: 'Labourer', value: 'labour.first_name' },
    { label: 'Project', value: 'project.projectName' },
    { label: 'Clock In', value: 'clock_in_time' },
    { label: 'Clock Out', value: 'clock_out_time' },
    { label: 'Duration (Minutes)', value: 'duration_minutes' },
  ];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(history);

  if (password) {
    // Send as a password-protected ZIP
    const zipFileName = `attendance-history-${labourerId}.zip`;
    const csvFileName = `attendance-history-${labourerId}.csv`;
    res.attachment(zipFileName);

    archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));
    const archive = archiver('zip-encryptable', {
      zlib: { level: 9 },
      password: password,
    });

    archive.on('error', (err) => { throw err; });
    archive.pipe(res);
    archive.append(csv, { name: csvFileName });
    await archive.finalize();

  } else {
    // Send as a plain CSV
    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-history-${labourerId}.csv`);
    res.send(csv);
  }
});

// Download a weekly timesheet for a labourer as CSV
exports.downloadWeeklyTimesheet = catchAsync(async (req, res) => {
  const { labourerId } = req.params;
  const { weekOf, password } = req.query;

  const startOfWeek = moment(weekOf).startOf('isoWeek').toDate();
  const endOfWeek = moment(weekOf).endOf('isoWeek').toDate();

  logger.info(`Generating weekly timesheet CSV for labourer ID ${labourerId} for the week of ${moment(startOfWeek).format('YYYY-MM-DD')}`);

  const records = await LabourAttendance.findAll({
    where: {
      labour_id: labourerId,
      status: 'clocked_out',
      clock_in_time: {
        [Op.gte]: startOfWeek,
        [Op.lte]: endOfWeek,
      }
    },
    include: [
      { model: db.project, attributes: ['projectName'] },
      { model: db.labour, attributes: ['first_name', 'last_name'] }
    ],
    order: [['clock_in_time', 'ASC']],
    raw: true,
    nest: true,
  });

  if (records.length === 0) {
    return res.status(404).send({ message: 'No attendance records found for the given week.' });
  }

  const fields = [
    { label: 'Labourer', value: 'labour.first_name' },
    { label: 'Project', value: 'project.projectName' },
    { label: 'Clock In', value: (row) => moment(row.clock_in_time).format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Clock Out', value: (row) => moment(row.clock_out_time).format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Duration (Minutes)', value: 'duration_minutes' },
    { label: 'Duration (Hours)', value: (row) => (row.duration_minutes / 60).toFixed(2) },
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(records);

  const weekString = moment(startOfWeek).format('YYYY-MM-DD');
  const csvFileName = `timesheet-${labourerId}-week-of-${weekString}.csv`;

  if (password) {
    // Send as a password-protected ZIP
    const zipFileName = `timesheet-${labourerId}-week-of-${weekString}.zip`;
    res.attachment(zipFileName);

    archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));
    const archive = archiver('zip-encryptable', {
      zlib: { level: 9 },
      password: password,
    });

    archive.on('error', (err) => { throw err; });
    archive.pipe(res);
    archive.append(csv, { name: csvFileName });
    await archive.finalize();
  } else {
    // Send as a plain CSV
    res.header('Content-Type', 'text/csv');
    res.attachment(csvFileName);
    res.send(csv);
  }
});

// Get a list of all labourers currently clocked in on a specific project
exports.getCurrentlyClockedIn = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  logger.info(`Retrieving currently clocked-in labourers for project ID: ${projectId}`);
  const clockedInLabourers = await LabourAttendance.findAll({
    where: {
      project_id: projectId,
      status: 'clocked_in'
    },
    include: [
      { model: db.labour, attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number'] }
    ],
    order: [['clock_in_time', 'ASC']],
  });

  res.status(200).send(clockedInLabourers);
});

// Get a summary of total clocked hours for an entire project
exports.getProjectHoursSummary = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  const totalMinutes = await LabourAttendance.sum('duration_minutes', {
    where: {
      project_id: projectId,
      status: 'clocked_out'
    }
  });

  const totalHours = totalMinutes ? (totalMinutes / 60).toFixed(2) : 0;

  logger.info(`Retrieved total clocked hours summary for project ID ${projectId}: ${totalHours} hours.`);
  res.status(200).send({
    projectId,
    totalHours: parseFloat(totalHours)
  });
});