const { clearCacheByTag } = require('../utils/cache.util');

module.exports = (sequelize, Sequelize) => {
  const Department = sequelize.define("department", {
    departmentName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    organizationId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      afterCreate: async (department, options) => {
        await clearCacheByTag('departments');
      },
      afterBulkUpdate: async (options) => {
        // This hook will trigger for update, soft-delete, and bulk-soft-delete
        await clearCacheByTag('departments');
      }
    }
  });

  return Department;
};