module.exports = (sequelize, Sequelize) => {
  const Phase = sequelize.define(
    "phase",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      project_status: {
        type: Sequelize.ENUM,
        values: ["inplanning", "inprocess", "completed"],
        allowNull: false,
      },
      is_Active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return Phase;
};
