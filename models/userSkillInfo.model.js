module.exports = (sequelize, Sequelize) => {
    const UserSKillInfo = sequelize.define("user_personal_info", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      skill_id:{
        type: Sequelize.STRING,
        allowNull: true
      },
      skill_level_id:{
        type: Sequelize.STRING,
        allowNull: true
      },
      business_domain_id:{
        type: Sequelize.STRING,
        allowNull: true
      },
    }, {
        timestamps: false,
        freezeTableName: true,
        underscored: true
    });
  
    return UserSKillInfo;
  };