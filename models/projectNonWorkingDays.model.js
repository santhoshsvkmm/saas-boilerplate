module.exports = (sequelize, Sequelize) => {
  const ProjectNonWorkingDays = sequelize.define(
    "project_non_working_days",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: true },
      date: { type: Sequelize.DATE, allowNull: false },
      version_id: { type: Sequelize.INTEGER, allowNull: false },
      project_id: { type: Sequelize.INTEGER, allowNull: false },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return ProjectNonWorkingDays;
};
