module.exports = (sequelize, Sequelize) => {
  const Delivery = sequelize.define(
    "material_delivery",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      material_purchase_order_id: {
        type: Sequelize.INTEGER,
      },
      ActualQuantity: {
        type: Sequelize.DECIMAL(10, 2),
      },
      ActualDeliveryDate: {
        type: Sequelize.DATE,
      },
    },
    {
      timestamps: false,
    }
  );
  return Delivery;
};
