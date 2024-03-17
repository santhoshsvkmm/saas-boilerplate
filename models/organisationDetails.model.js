module.exports = (sequelize, Sequelize) => {
    const OrganisationDetails = sequelize.define("organisation_details", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    });
  
    return OrganisationDetails;
  };