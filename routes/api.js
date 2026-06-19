var express = require('express');
var router = express.Router();

var organizationRouter = require('./organization.routes')
var featureRouter = require('./feature.route');
var branchRouter = require('./branch.routes');
var userRouter = require('./user.routes')
var departmentRouter = require('./department.routes')
var designationRouter = require('./designation.routes')
var departmentAnnouncementRouter = require('./departmentAnnouncement.routes')
var jobRouter = require('./job.routes')
var daysHolidayRouter = require('./daysHoliday.routes')
var projectRouter = require('./project.routes')
var daysWorkingRouter = require('./daysWorking.routes')
var expenseRouter = require('./expense.routes')
var paymentRouter = require('./payment.routes')
var applicationRouter = require('./application.routes')
var userMessageRouter = require('./userMessage.routes')
var userPersonalEventRouter = require('./userPersonalEvent.routes')
var userPersonalInformationRouter = require('./userPersonalInformation.routes')
var userFinancialInformationRouter = require('./userFinacnialInformation.routes');
var skillTypesRouter = require('./skillTypes.routes');
var skillsRouter = require('./skills.routes');
var materialRouter = require('./material.routes');
var supplierRouter = require('./supplier.routes');
var clientRouter = require('./client.routes');
var subcontractorRouter = require('./subcontractor.routes');
var consultantRouter = require('./consultant.routes');
var materialTenderingRouter = require('./materialTendering.routes.js');
var materialBiddingRouter = require('./materialBidding.routes.js');
var materialProcurementPlanRouter = require('./materialProcurementPlan.routes.js');
var materialPurchaseOrderRouter = require('./materialPurchaseOrder.routes.js');
var phaseRouter = require('./phase.routes.js');
var taskRouter = require('./task.routes.js');
var labourRouter = require('./labour.routes.js');
var lookaheadRouter = require('./lookahead.routes.js');
var projectVersionRouter = require('./projectVersion.routes.js');
var labourAttendanceRouter = require('./labourAttendance.routes.js');
var materialDeliveryRouter = require('./materialDelivery.routes.js');
var rolesRouter = require("./roles.routes");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('this is the index for api')
});

router.use('/organisations', organizationRouter)
router.use('/roles',rolesRouter)
router.use('/branches', branchRouter)
router.use('/feature',featureRouter)
router.use('/users', userRouter)
router.use('/departments', departmentRouter)
router.use('/designations', designationRouter)
router.use('/departmentAnnouncements', departmentAnnouncementRouter)
router.use('/jobs', jobRouter)
router.use('/daysHolidays', daysHolidayRouter)
router.use('/projects', projectRouter)
router.use('/daysWorkings', daysWorkingRouter)
router.use('/expenses', expenseRouter)
router.use('/payments', paymentRouter)
router.use('/applications', applicationRouter)
router.use('/messages', userMessageRouter)
router.use('/personalEvents', userPersonalEventRouter)
router.use('/personalInformations', userPersonalInformationRouter)
router.use('/financialInformations', userFinancialInformationRouter)
router.use('/skillTypes', skillTypesRouter)
router.use('/skills', skillsRouter);
router.use('/materials', materialRouter)
router.use('/suppliers', supplierRouter);
router.use('/clients', clientRouter);
router.use('/subcontractors', subcontractorRouter);
router.use('/consultants', consultantRouter);
router.use('/tenders', materialTenderingRouter);
router.use('/bids', materialBiddingRouter);
router.use('/procurement-plans', materialProcurementPlanRouter)
router.use('/purchase-orders', materialPurchaseOrderRouter);
router.use('/phases', phaseRouter);
router.use('/tasks', taskRouter);
router.use('/labourers', labourRouter);
router.use('/lookaheads', lookaheadRouter);
router.use('/project-versions', projectVersionRouter);
router.use('/labour-attendance', labourAttendanceRouter);
router.use('/deliveries', materialDeliveryRouter);

module.exports = router;
