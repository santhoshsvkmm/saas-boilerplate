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
        task_name: {
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
            type: Sequelize.ENUM,
            values: ["low", "meduim", "high","crucial"],
            allowNull: false,
        },
        is_Active: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        is_milestone: {
            type: Sequelize.BOOLEAN,
            allowNull: false
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
            allowNull: false,
            validate: {
              notEmpty: true,
            },
        } ,
        successor :{
            type: Sequelize.JSON,  
            allowNull: false,
            validate: {
              notEmpty: true,
            },
        },
        is_contracted: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        assigned_to: {
            type: Sequelize.JSON,  
            allowNull: false,
            validate: {
              notEmpty: true,
            },
        }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    });

    return Task;
};