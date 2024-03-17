module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      email:{
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        },
        unique: {
          args: 'email',
          msg: 'This email is already taken!'
        }
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        },
        unique: {
          args: 'username',
          msg: 'This username is already taken!'
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM,
        values: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'],
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
        timestamps: false,
        underscored: true,
        freezeTableName: true
    });
  
    return User;
  };