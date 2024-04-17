module.exports = (sequelize, Sequelize) => {
  const MaterialProcurementPlan = sequelize.define(
    "procurement_plan",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      material_id: {
        type: Sequelize.INTEGER,
      },
      planned_quantity: {
        type: Sequelize.DECIMAL,
      },
      planned_date: {
        type: Sequelize.DATE,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return MaterialProcurementPlan
};
