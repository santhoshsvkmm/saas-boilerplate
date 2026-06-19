const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.organisation = require("./organisation.model")(sequelize, Sequelize);
db.branch = require("./branch.model.js")(sequelize, Sequelize);
db.organisationDetails = require("./organisationDetails.model.js")(sequelize, Sequelize);
db.roles = require("./roles.model.js")(sequelize, Sequelize);
db.feature = require("./feature.model.js")(sequelize, Sequelize);
db.user = require("./user.model")(sequelize, Sequelize);
db.userPersonalInfo = require("./userPersonalInfo.model")(sequelize, Sequelize)
db.userFinancialInfo = require("./userFinancialInfo.model")(sequelize, Sequelize)
db.userPersonalEvent = require("./userPersonalEvent.model")(sequelize, Sequelize)
db.department = require("./department.model")(sequelize, Sequelize);
db.deptAnnouncement = require("./deptAnnouncement.model")(sequelize, Sequelize);
db.job = require("./job.model")(sequelize, Sequelize);
db.project = require("./project.model.js")(sequelize, Sequelize);
db.projectlocationinfo = require("./projectLocationInfo.model.js")(sequelize, Sequelize);
db.projectnonworkingdays = require("./projectNonWorkingDays.model.js")(sequelize, Sequelize);
db.projectverison = require("./projectVersion.model.js")(sequelize, Sequelize);
db.phase = require("./phase.model.js")(sequelize, Sequelize);
db.task = require("./task.model.js")(sequelize, Sequelize);
db.taskresourcedetails = require("./taskResourceDetails.model.js")(sequelize, Sequelize);
db.payment = require("./payment.model")(sequelize, Sequelize);
db.expense = require("./expense.model")(sequelize, Sequelize);
db.desgination = require("./desgination.model.js")(sequelize,Sequelize);
db.skillTypes = require("./skillTypes.model.js")(sequelize,Sequelize);
db.skills = require("./skills.model.js")(sequelize,Sequelize);
db.material = require("./materials.model.js")(sequelize,Sequelize);
db.materialProcurementPlan = require("./materialProcurementPlan.model.js")(sequelize,Sequelize);
db.materialPurchaseOrder = require("./materialPurchaseOrders.model.js")(sequelize,Sequelize);
db.materialDelivery = require("./materialDelivery.model.js")(sequelize,Sequelize);
db.client = require("./client.model.js")(sequelize,Sequelize);
db.clientOfficalInfo = require("./clientOfficalInfo.model.js")(sequelize,Sequelize);
db.subContractor = require("./subcontractor.model.js")(sequelize,Sequelize);
db.subContractorOfficalInfo = require("./subcontractorOfficalInfo.model.js")(sequelize,Sequelize);
db.supplier=require("./supplier.model.js")(sequelize,Sequelize);
db.supplierOfficailInfo=require("./supplierOfficalInfo.model.js")(sequelize,Sequelize);
db.materialTender = require("./materialTendering.model.js")(sequelize,Sequelize);
db.materialStockHistory = require("./materialStockHistory.model.js")(sequelize,Sequelize);
db.materialBidding = require("./materialBidding.model.js")(sequelize,Sequelize);
db.lookahead = require("./lookahead.model.js")(sequelize,Sequelize);
db.labourAttendance = require("./labourAttendance.model.js")(sequelize,Sequelize);


//organisation Associations
db.organisation.hasOne(db.organisationDetails, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.roles, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.branch, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.department, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.user, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.feature, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.skillTypes, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.project, { foreignKey: { name: 'organisationId', allowNull: false }});
db.organisation.hasMany(db.material, { foreignKey: { name: 'organisationId', allowNull: false }});

//roles Associations
db.roles.hasMany(db.user, { foreignKey: { name: 'roleId', allowNull: false }});

//feature Associations
// db.feature.hasMany(db.roles,{foreginKey:{allowNull:false}})

//Branch Associations
db.branch.hasMany(db.department, { foreignKey: { name: 'branchId', allowNull: false }});

//Department Associations
db.department.hasMany(db.desgination, { foreignKey: { name: 'departmentId', allowNull: false }});
db.department.hasMany(db.user, { foreignKey: 'departmentId', onDelete: 'SET NULL', hooks: true });
db.department.hasMany(db.deptAnnouncement, { foreignKey: 'departmentId', onDelete: 'CASCADE', hooks: true });
db.department.hasMany(db.expense, { foreignKey: { name: 'departmentId', allowNull: false }});

//skillType Associations
db.skillTypes.hasMany(db.skills, { foreignKey: { name: 'skillTypeId', allowNull: false }});

// User Associations
db.user.hasOne(db.userPersonalInfo, { foreignKey: { name: 'userId', allowNull: false }});
db.user.hasOne(db.userFinancialInfo, { foreignKey: { name: 'userId', allowNull: false }});
db.user.hasMany(db.userPersonalEvent, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE', hooks: true });
db.user.hasMany(db.project, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE', hooks: true });
db.user.hasMany(db.deptAnnouncement, { foreignKey: { name: 'createdByUserId', allowNull: false }, onDelete: 'CASCADE', hooks: true });
db.user.hasMany(db.job, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE', hooks: true });
db.user.belongsTo(db.department, { foreignKey: { name: 'departmentId', allowNull: true }});
db.user.belongsTo(db.desgination, { foreignKey: { name: 'desginationId', allowNull: true }});
db.user.belongsTo(db.branch, { foreignKey: { name: 'branchId', allowNull: true }});

// User Financial Informations Assocations
db.userFinancialInfo.belongsTo(db.user, { foreignKey: { name: 'userId', allowNull: false }});

// Expense Association
db.expense.belongsTo(db.department, { foreignKey: { name: 'departmentId', allowNull: false }});

// Job Associations
db.job.hasMany(db.payment, { foreignKey: { name: 'jobId', allowNull: true }, onDelete: 'CASCADE', hooks: true });
db.job.belongsTo(db.user, { foreignKey: { name: 'userId', allowNull: false }});

// project Associations
db.project.belongsTo(db.user);
db.project.belongsTo(db.organisation);
db.project.hasOne(db.projectlocationinfo);
db.project.hasMany(db.projectverison, { foreignKey: { name: 'projectId', allowNull: true }, onDelete: 'CASCADE', hooks: true });
db.project.hasMany(db.material, { foreignKey: { name: 'projectId', allowNull: true }, onDelete: 'CASCADE', hooks: true });
db.project.hasMany(db.materialProcurementPlan, { foreignKey: { name: 'projectId', allowNull: true }, onDelete: 'CASCADE', hooks: true });

//projectversion Associations
db.projectverison.hasMany(db.task, { foreignKey: { name: 'projectVersionId', allowNull: true }, onDelete: 'CASCADE', hooks: true });
db.projectverison.hasMany(db.projectnonworkingdays, { foreignKey: { name: 'projectVersionId', allowNull: true }, onDelete: 'CASCADE', hooks: true });
db.projectverison.hasMany(db.phase, { foreignKey: { name: 'projectVersionId', allowNull: true }, onDelete: 'CASCADE', hooks: true });

// Task-Material Association (Many-to-Many through TaskResourceDetails)
db.task.belongsToMany(db.material, { through: db.taskresourcedetails, foreignKey: 'task_id' });
db.material.belongsToMany(db.task, { through: db.taskresourcedetails, foreignKey: 'material_id' });

// Task-Labourer Association (Many-to-Many through TaskResourceDetails)
db.task.belongsToMany(db.labour, { through: db.taskresourcedetails, foreignKey: 'task_id' });
db.labour.belongsToMany(db.task, { through: db.taskresourcedetails, foreignKey: 'labour_id' });

// Lookahead (Sprint) Associations
db.projectverison.hasMany(db.lookahead, { foreignKey: 'projectVersionId' });
db.lookahead.belongsToMany(db.task, { through: 'LookaheadTasks' });
db.task.belongsToMany(db.lookahead, { through: 'LookaheadTasks' });

// Labourer-Attendance Association
db.labour.hasMany(db.labourAttendance, { foreignKey: 'labour_id' });
db.labourAttendance.belongsTo(db.labour, { foreignKey: 'labour_id' });
db.labourAttendance.belongsTo(db.project, { foreignKey: 'project_id' });

// Payment Associations
db.payment.belongsTo(db.job)

// Announcement Associations
db.deptAnnouncement.belongsTo(db.department, { foreignKey: { name: 'departmentId', allowNull: true }});
db.deptAnnouncement.belongsTo(db.user, { foreignKey: { name: 'createdByUserId', allowNull: false }});


//Material Associations
db.material.hasMany(db.materialProcurementPlan);
db.material.hasMany(db.materialPurchaseOrder);
db.material.hasMany(db.materialDelivery);
db.material.hasMany(db.materialStockHistory, { foreignKey: 'material_id' });
db.materialStockHistory.belongsTo(db.user, { foreignKey: 'related_entity_id', constraints: false, as: 'adjustingUser' });



//Material Procurement Plan Associations
db.materialProcurementPlan.hasMany(db.materialPurchaseOrder);

//Material Purchase Order Plan Associations
db.materialPurchaseOrder.hasMany(db.materialDelivery)

//Material Tender Associations
db.materialTender.hasMany(db.materialBidding)
db.materialBidding.belongsTo(db.materialTender)

// Project-Consultant Association (Many-to-Many)
db.project.belongsToMany(db.consultant, { through: 'ProjectConsultants' });
db.consultant.belongsToMany(db.project, { through: 'ProjectConsultants' });

module.exports = db;