module.exports = (sequelize, Sequelize) => {
  const Labour = sequelize.define("labour", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: Sequelize.STRING, allowNull: false },
    last_name: { type: Sequelize.STRING, allowNull: false },
    phone_number: { type: Sequelize.NUMBER, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sub_contractor_id: {},
    supplier_id: {},
  });
  return Labour;
};
