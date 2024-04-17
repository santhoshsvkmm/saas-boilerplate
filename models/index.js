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
db.materialBidding = require("./materialBidding.model.js")(sequelize,Sequelize);


//organisation Associations
db.organisation.hasOne(db.organisationDetails,{foreignKey:{allowNull:false}});
db.organisation.hasMany(db.roles,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.branch,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.department,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.user,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.feature,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.skillTypes,{foreginKey:{allowNull:false}})
db.organisation.hasMany(db.skills,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.project,{foreginKey:{allowNull:false}});
db.organisation.hasMany(db.material,{foreginKey:{allowNull:false}});

//roles Associations
db.roles.hasMany(db.user,{foreginKey:{allowNull:false}});

//feature Associations
// db.feature.hasMany(db.roles,{foreginKey:{allowNull:false}})

//Branch Associations
db.branch.hasMany(db.department,{foreginKey:{allowNull:false}});

//Department Associations
db.department.hasMany(db.desgination,{foreginKey:{allowNull:false}});

//skillType Associations
db.skillTypes.hasMany(db.skills,{foreginKey:{allowNull:false}})

// User Associations
db.user.hasOne(db.userPersonalInfo, {foreignKey: {allowNull: false}})
db.user.hasOne(db.userFinancialInfo, {foreignKey: {allowNull: false}})
db.user.hasMany(db.userPersonalEvent, {foreignKey: {allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.hasMany(db.project, {foreignKey: {allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.hasMany(db.deptAnnouncement, {foreignKey: {name: 'createdByUserId', allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.hasMany(db.job, {foreignKey: {allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.belongsTo(db.department, {foreginKey: {allowNull: true}})
db.user.belongsTo(db.desgination, {foreginKey: {allowNull: true}})
db.user.belongsTo(db.branch, {foreginKey: {allowNull: true}})
// User Financial Informations Assocations
db.userFinancialInfo.belongsTo(db.user, {foreignKey: {allowNull: false}})

// Department Associations
db.department.hasMany(db.user, {onDelete: 'CASCADE', hooks: true})
db.department.hasMany(db.deptAnnouncement, {foreignKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true})
db.department.hasMany(db.expense, {foreignKey: {allowNull: false}})

// Expense Association
db.expense.belongsTo(db.department, {foreignKey: {allowNull: false}})

// Job Associations
db.job.hasMany(db.payment, {foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true})
db.job.belongsTo(db.user, {foreignKey: {allowNull: false}})

// project Associations
db.project.belongsTo(db.user);
db.project.belongsTo(db.organisation);
db.project.hasOne(db.projectlocationinfo);
db.project.hasMany(db.projectverison,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true});
db.project.hasMany(db.material,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true});
db.project.hasMany(db.materialProcurementPlan,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true})

//projectversion Associations
db.projectverison.hasMany(db.task,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true});
db.projectverison.hasMany(db.projectnonworkingdays,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true});
db.projectverison.hasMany(db.phase,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true});

//task Associations
// db.task.hasMany(db.materials,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true})
// db.task.hasMany(db.labours,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true})
// db.task.hasMany(db.equipments,{foreginKey: {allowNull: true}, onDelete: 'CASCADE', hooks: true})
// Payment Associations
db.payment.belongsTo(db.job)

// Announcement Associations
db.deptAnnouncement.belongsTo(db.department, {foreignKey: {allowNull: true}})
db.deptAnnouncement.belongsTo(db.user, {foreignKey: {name: 'createdByUserId', allowNull: false}})


//Material Associations
db.material.hasMany(db.materialProcurementPlan);
db.material.hasMany(db.materialPurchaseOrder);
db.material.hasMany(db.materialDelivery);


//Material Procurement Plan Associations
db.materialProcurementPlan.hasMany(db.materialPurchaseOrder);

//Material Purchase Order Plan Associations
db.materialPurchaseOrder.hasMany(db.materialDelivery)

//Material Tender Associations
db.materialTender.hasMany(db.materialBidding)
db.materialBidding.belongsTo(db.materialTender)

module.exports = db;