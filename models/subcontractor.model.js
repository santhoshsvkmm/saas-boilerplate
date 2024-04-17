const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
module.exports = (sequelize, Sequelize) => {
  const SubContractor = sequelize.define(
    "sub_contractor",
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
      sub_contract_organisation_name: {
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
        beforeCreate: (sub_contractor, options) => {
          const hashedPassword = bcrypt.hashSync(
            sub_contractor.password,
            SALT_ROUNDS
          );
          sub_contractor.password = hashedPassword;
        },
      },
    }
  );

  return SubContractor;
};
