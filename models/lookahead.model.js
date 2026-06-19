module.exports = (sequelize, Sequelize) => {
  const Lookahead = sequelize.define("lookahead", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "e.g., 'Week 42 Lookahead', 'Foundation Sprint'"
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'planning', // planning, active, completed
    },
    projectVersionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  });

  return Lookahead;
};