const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
module.exports = (sequelize, Sequelize) => {
  const Consultant = sequelize.define(
    "consultant",
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
      consultant_organisation_name: {
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
        beforeCreate: (consultant, options) => {
          const hashedPassword = bcrypt.hashSync(
            consultant.password,
            SALT_ROUNDS
          );
          consultant.password = hashedPassword;
        },
      },
    }
  );

  return Consultant;
};
