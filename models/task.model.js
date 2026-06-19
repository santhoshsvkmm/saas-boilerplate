module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define("task", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        task_id:{
            type: Sequelize.STRING,
            allowNull: true
        },
        name: { // Renaming for consistency with controller
            type: Sequelize.STRING,
            allowNull: true
        },
        startDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        endDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        task_priority:{
            type: Sequelize.STRING, // Using STRING for more flexibility
            allowNull: true,
        },
        is_active: { // Renaming for consistency
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        is_milestone: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        is_criticalTask: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        organisation_id:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        predecessor:{
            type: Sequelize.JSON,
            allowNull: true,
        } ,
        successor :{
            type: Sequelize.JSON,
            allowNull: true,
        },
        is_contracted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        assigned_to: {
            type: Sequelize.JSON,
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        clonedFromTaskId: { // Link to the original task ID when cloned
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'not-started'
        },
        blocker_reason: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        progress: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        effort: { // The new field for story points or hours
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 1.00
        },
        completedAt: {
            type: Sequelize.DATE,
            allowNull: true
        },
        isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    });

    return Task;
};