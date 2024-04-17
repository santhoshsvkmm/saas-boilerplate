module.exports = (sequelize, Sequelize) => {
    const Department = sequelize.define("department", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        departmentName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        branch_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
        organisation_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    });

    return Department;
};