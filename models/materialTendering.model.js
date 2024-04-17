module.exports = (sequelize, Sequelize) => {
  const materialTender = sequelize.define(
    "material_tender",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      materialDetails: { type: Sequelize.JSON },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      organisation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      submissionDeadline: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active", // Example values: 'active', 'pending', 'expired', 'terminated'
      },
      terms: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_open_tender: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
      // Additional fields as required, such as 'value', 'contractorDetails', etc.
    },
    {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );
  return materialTender;
};
