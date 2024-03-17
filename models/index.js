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
db.application = require("./application.model")(sequelize, Sequelize);
db.payment = require("./payment.model")(sequelize, Sequelize);
db.expense = require("./expense.model")(sequelize, Sequelize);



//organisation Associations
db.organisation.hasOne(db.organisationDetails,{foreignKey:{allowNull:false}})
db.organisation.hasMany(db.roles,{foreginKey:{allowNull:false}})
db.organisation.hasMany(db.user,{foreginKey:{allowNull:false}})
db.organisation.hasMany(db.feature,{foreginKey:{allowNull:false}})



//roles Associations
db.roles.hasMany(db.user,{foreginKey:{allowNull:false}});

//feature Associations
db.feature.hasMany(db.roles,{foreginKey:{allowNull:false}})

//branch Associations


// User Associations
db.user.hasOne(db.userPersonalInfo, {foreignKey: {allowNull: false}})
db.user.hasOne(db.userFinancialInfo, {foreignKey: {allowNull: false}})
db.user.hasMany(db.userPersonalEvent, {foreignKey: {allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.hasMany(db.application, {foreignKey: {allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.hasMany(db.deptAnnouncement, {foreignKey: {name: 'createdByUserId', allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.hasMany(db.job, {foreignKey: {allowNull: false}, onDelete: 'CASCADE', hooks: true})
db.user.belongsTo(db.department, {foreginKey: {allowNull: true}})

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

// Application Associations
db.application.belongsTo(db.user)

// Payment Associations
db.payment.belongsTo(db.job)

// Announcement Associations
db.deptAnnouncement.belongsTo(db.department, {foreignKey: {allowNull: true}})
db.deptAnnouncement.belongsTo(db.user, {foreignKey: {name: 'createdByUserId', allowNull: false}})

module.exports = db;