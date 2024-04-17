const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define(
    "supplier",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      supplier_organisation_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_person_firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_person_lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true, // Add createdAt and updatedAt timestamps
      hooks: {
        beforeCreate: (supplier, options) => {
          const hashedPassword = bcrypt.hashSync(
            supplier.password,
            SALT_ROUNDS
          );
          supplier.password = hashedPassword;
        },
      },
    }
  );

  return Supplier;
};
