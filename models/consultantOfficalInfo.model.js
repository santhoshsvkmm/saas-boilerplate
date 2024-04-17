module.exports = (sequelize, Sequelize) => {
    const ConsultantOfficalInfo = sequelize.define(
      "consultant_offical_info",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        consultant_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        country: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        project_ids: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        organisation_ids: {
          type: Sequelize.JSON,
          allowNull: true,
        }
      },
      {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      }
    );
  
    return ConsultantOfficalInfo;
  };
  