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
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      } 
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    });
  
    return OrganisationDetails;
  };