module.exports = (sequelize, Sequelize) => {
    const SkillTypes = sequelize.define(
      "skilltypes",
      {
        skilltypename: {
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
  
    return Skills
    ;
  };
  