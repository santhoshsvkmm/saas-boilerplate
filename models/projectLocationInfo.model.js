module.exports = (sequelize, Sequelize) => {
    const ProjectLocationInfo = sequelize.define("project_location_info", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        address:{
            type: Sequelize.STRING,
            allowNull: true
        },
        country: {
            type: Sequelize.STRING,
            allowNull: true
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true
        },
        state: {
            type: Sequelize.STRING,
            allowNull: true
        },
        project_id:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    });

    return ProjectLocationInfo;
};