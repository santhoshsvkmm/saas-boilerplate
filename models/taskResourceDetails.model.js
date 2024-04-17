module.exports = (sequelize, Sequelize) => {
    const TaskResourceDetails = sequelize.define("taskresourcedetails", {
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
        material_id: {
            type: Sequelize.JSON,  
            allowNull: false,
            validate: {
              notEmpty: true,
            },
        },
        labour_id: {
            type: Sequelize.JSON,  
            allowNull: false,
            validate: {
              notEmpty: true,
            },
        },
        equipment_id:{
            type: Sequelize.JSON,  
            allowNull: false,
            validate: {
              notEmpty: true,
            },
        },
        version_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        project_id:{
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    });

    return TaskResourceDetails;
};