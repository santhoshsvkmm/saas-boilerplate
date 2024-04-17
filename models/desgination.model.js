const { department } = require(".");

module.exports = (sequelize, Sequelize) => {
  const Designation = sequelize.define(
    "designation",

    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      designationname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      organisation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },

    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return Designation;
};
