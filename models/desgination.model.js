module.exports = (sequelize, Sequelize) => {
    const Designation = sequelize.define(
      "designation",
      {
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
      },
      {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      }
    );
  
    return Designation
    ;
  };
  