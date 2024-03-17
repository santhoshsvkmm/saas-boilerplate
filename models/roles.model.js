module.exports = (sequelize, Sequelize) => {
    const Roles = sequelize.define("roles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      role_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          validate: {
            notEmpty: true
          }
      }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    });
  
    return Roles;
  };