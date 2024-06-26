module.exports = (sequelize, Sequelize) => {
  const Skills = sequelize.define(
    "skills",

    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      skillname: {
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
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return Skills;
};
