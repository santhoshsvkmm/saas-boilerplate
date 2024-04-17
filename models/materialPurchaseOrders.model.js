module.exports = (sequelize, Sequelize) => {
  const PurchaseOrder = sequelize.define(
    "purchase_order",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batch_number: {
        type: Sequelize.STRING,
        allowNull: true, // This allows for purchase orders that may not be associated with a batch.
      },
      material_id: {
        type: Sequelize.INTEGER,
      },
      material_procurement_plan_id: {
        type: Sequelize.INTEGER,
      },
      supplier_id: {
        type: Sequelize.INTEGER,
      },
      sub_contractor_id:{
        type: Sequelize.INTEGER,
      },
      OrderedQuantity: {
        type: Sequelize.DECIMAL(10, 2),
      },
      OrderDate: {
        type: Sequelize.DATE,
      },
      ExpectedDeliveryDate: {
        type: Sequelize.DATE,
      },
    },
    {
      timestamps: false,
    }
  );
  
  return PurchaseOrder;
};
