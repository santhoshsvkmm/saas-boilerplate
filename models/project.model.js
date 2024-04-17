module.exports = (sequelize, Sequelize) => {
    const Project = sequelize.define("project", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name:{
            type: Sequelize.STRING,
            allowNull: true
        },
        description: {
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
        is_Active: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        project_type: {
            type: Sequelize.ENUM,
            values: ['construction','software'],
            allowNull: false
        },
        organisation_id:{
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    });

    return Project;
};