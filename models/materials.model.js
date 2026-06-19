const { clearCacheByTag } = require('../utils/cache.util');
const sendEmail = require('../services/email.services');
const reorderNotification = require('../emailTemplates/reorderNotification');
const logger = require('../loggers/logger');

module.exports = (sequelize, Sequelize) => {
  const Material = sequelize.define("material", {
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT },
    category: { type: Sequelize.STRING },
    unit: { type: Sequelize.STRING },
    quantity_in_stock: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
    unit_price: { type: Sequelize.DECIMAL(10, 2) },
    safety_stock: { type: Sequelize.INTEGER },
    reorder_level: { type: Sequelize.INTEGER },
    supplier_id: { type: Sequelize.INTEGER },
    project_id: { type: Sequelize.INTEGER },
    organisation_id: { type: Sequelize.INTEGER, allowNull: false },
    status: { type: Sequelize.STRING },
    isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false }
  }, {
    hooks: {
      afterUpdate: async (material, options) => {
        // Check if quantity_in_stock was changed and crossed the reorder threshold
        if (options.fields.includes('quantity_in_stock')) {
          const previousStock = material.previous('quantity_in_stock');
          const currentStock = material.quantity_in_stock;
          const reorderLevel = material.reorder_level;

          if (currentStock < reorderLevel && previousStock >= reorderLevel) {
            try {
              const procurementManagerEmail = process.env.PROCUREMENT_MANAGER_EMAIL || 'procurement@example.com';
              await sendEmail(
                procurementManagerEmail,
                `Low Stock Alert: ${material.name}`,
                reorderNotification(material.name, currentStock, reorderLevel)
              );
              logger.info(`Sent low stock notification for material ID: ${material.id}`);
            } catch (emailError) {
              logger.error(`Failed to send low stock email for material ID ${material.id}:`, emailError);
            }
          }
        }
      },
      afterBulkUpdate: async () => {
        // This hook handles cache invalidation for bulk updates (like soft deletes)
        await clearCacheByTag('materials');
        await clearCacheByTag('inventory-summary');
        await clearCacheByTag('inventory-summary-by-category');
        await clearCacheByTag('materials-reorder-needed');
      },
      afterCreate: async () => {
        await clearCacheByTag('materials');
        await clearCacheByTag('inventory-summary');
        await clearCacheByTag('inventory-summary-by-category');
        await clearCacheByTag('materials-reorder-needed');
      }
    }
  });

  return Material;
};