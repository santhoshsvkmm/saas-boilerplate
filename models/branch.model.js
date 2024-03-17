module.exports = (sequelize, Sequelize) => {
    const Branch = sequelize.define(
      "branch",
      {
        branchName: {
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
  
    return Branch
    ;
  };
  