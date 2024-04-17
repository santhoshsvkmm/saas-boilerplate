module.exports = (sequelize, Sequelize) => {
  const ProjectLocationInfo = sequelize.define(
    "project_location_info",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      version_status: {
        type: Sequelize.ENUM,
        values: ["inplanning", "inprocess", "onhold", "completed"],
        allowNull: false,
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return ProjectLocationInfo;
};
