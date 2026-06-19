module.exports = (sequelize, Sequelize) => {
  const MaterialStockHistory = sequelize.define("material_stock_history", {
    change_quantity: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "The amount the stock changed by. Can be positive or negative."
    },
    new_quantity: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "The stock level after the change."
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "e.g., 'delivery_received', 'manual_adjustment', 'consumed_in_task'"
    },
    related_entity_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "ID of the related entity, e.g., a delivery ID or task ID."
    },
    material_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    reverted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: "Indicates if this adjustment has been reverted."
    }
  });

  return MaterialStockHistory;
};