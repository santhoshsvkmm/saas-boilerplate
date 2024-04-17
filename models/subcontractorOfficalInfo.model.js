module.exports = (sequelize, Sequelize) => {
    const SubContractorOfficalInfo = sequelize.define(
      "sub_contractor_offical_info",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        sub_contractor_id: {
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
  
    return SubContractorOfficalInfo;
  };
  