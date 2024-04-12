module.exports = (sequelize, Sequelize) => {
    const UsersRole = sequelize.define("user_personal_info", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      role_id:{
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
        timestamps: false,
        freezeTableName: true,
        underscored: true
    });
  
    return UsersRole;
  };