module.exports = (sequelize, Sequelize) => {
    const UserOfficalInfo = sequelize.define("user_personal_info", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      branch_id:{
        type: Sequelize.STRING,
        allowNull: true
      },
      department_id:{
        type: Sequelize.STRING,
        allowNull: true
      },
      desgination_id:{
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
  
    return UserOfficalInfo;
  };