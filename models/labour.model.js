const { clearCacheByTag } = require('../utils/cache.util');

module.exports = (sequelize, Sequelize) => {
  const Labour = sequelize.define("labour", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: Sequelize.STRING, allowNull: false },
    last_name: { type: Sequelize.STRING, allowNull: false },
    phone_number: { type: Sequelize.STRING, allowNull: false },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    organisation_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    sub_contractor_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }, {
    hooks: {
      afterCreate: async () => {
        await clearCacheByTag('labours');
      },
      afterBulkUpdate: async () => {
        // This hook will trigger for update, soft-delete, and bulk-soft-delete
        await clearCacheByTag('labours');
      }
    }
  });
  return Labour;
};
