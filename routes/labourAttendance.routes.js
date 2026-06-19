var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const validate = require('../middleware/validate.middleware.js');
const { cacheMiddleware } = require('../middleware/cache.middleware.js');
const { clockIn, clockOut, getHistory, getHoursSummaryForProject, getProjectClockedIn, getProjectHoursSummary, getProjectHoursByLabourer, getWeeklyTimesheet, downloadHistory, downloadWeeklyTimesheet } = require('../validationSchemas/labourAttendance.validation.js');

const attendance = require("../controllers/labourAttendance.controller.js");

// Clock in a labourer
router.post('/clock-in', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(clockIn), attendance.clockIn);

// Clock out a labourer
router.put('/clock-out', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(clockOut), attendance.clockOut);

// Get attendance history for a specific labourer
// Example: /api/labour-attendance/history/labourer/123?startDate=2023-01-01&endDate=2023-01-31
router.get('/history/labourer/:labourerId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getHistory), attendance.getHistory);

// Get a summary of total hours worked by a labourer on a specific project
router.get('/summary/labourer/:labourerId/project/:projectId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getHoursSummaryForProject), (req, res, next) => cacheMiddleware(`labourer-project-hours:${req.params.labourerId}:${req.params.projectId}`)(req, res, next), attendance.getHoursSummaryForProject);

// Get a list of all labourers currently clocked in on a specific project
router.get('/clocked-in/project/:projectId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getProjectClockedIn), (req, res, next) => cacheMiddleware(`project-clocked-in:${req.params.projectId}`)(req, res, next), attendance.getCurrentlyClockedIn);

// Get a breakdown of hours per labourer for a specific project
router.get('/summary/project/:projectId/by-labourer', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getProjectHoursByLabourer), (req, res, next) => cacheMiddleware(`project-hours-by-labourer:${req.params.projectId}`)(req, res, next), attendance.getProjectHoursByLabourer);

// Get a weekly timesheet summary for a labourer
router.get('/timesheet/labourer/:labourerId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getWeeklyTimesheet), attendance.getWeeklyTimesheet);

// Download a weekly timesheet for a labourer as CSV
router.get('/timesheet/labourer/:labourerId/download', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(downloadWeeklyTimesheet), attendance.downloadWeeklyTimesheet);

// Download attendance history for a labourer as CSV
router.get('/history/labourer/:labourerId/download', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(downloadHistory), attendance.downloadHistory);

// Get a summary of total clocked hours for an entire project
router.get('/summary/project/:projectId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getProjectHoursSummary), (req, res, next) => cacheMiddleware(`project-hours-summary:${req.params.projectId}`)(req, res, next), attendance.getProjectHoursSummary);

module.exports = router;