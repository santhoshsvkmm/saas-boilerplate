module.exports = (sequelize, Sequelize) => {
  const Material = sequelize.define(
    "material",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      category: {
        type: Sequelize.STRING,
      },
      unit: {
        type: Sequelize.STRING,
      },
      quantity_in_stock: {
        type: Sequelize.DECIMAL(10, 2),
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      safety_stock: {
        type: Sequelize.INTEGER,
      },
      reorder_level: {
        type: Sequelize.INTEGER,
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'suppliers', // This is a reference to another model
        //   key: 'id'
        // }
      },
      project_id: {
        type: Sequelize.INTEGER,
      },
      organisation_id: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return Material;
};
