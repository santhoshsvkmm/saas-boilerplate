module.exports = (sequelize, Sequelize) => {
  const SupplierOfficalInfo = sequelize.define(
    "supplier_offical_info",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      project_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      organisation_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      }
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return SupplierOfficalInfo;
};
