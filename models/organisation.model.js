module.exports = (sequelize, Sequelize) => {
  const Organisation = sequelize.define(
    "organisation",
    {
      organisationName: {
        type: Sequelize.STRING, 
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        unique: {
          args: "organisationName",
          msg: "This Organisation Name is already taken!",
        },
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
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

  return Organisation;
};
