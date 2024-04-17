module.exports = (sequelize, Sequelize) => {
  const MaterialBidding = sequelize.define("material_bidding", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    tender_id: { type: Sequelize.INTEGER },
    supplier_id: { type: Sequelize.INTEGER },
    sub_contractor_id:{ type: Sequelize.INTEGER },
    price: { type: Sequelize.DOUBLE, allowNull: false },
    comments: { type: Sequelize.TEXT },
  });
  return MaterialBidding;
};
