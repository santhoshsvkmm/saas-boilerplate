const db = require("../../models");
const User = db.user;
const { decodeToken } = require("../../utils/token");
require("dotenv").config();
const bcrypt = require("bcrypt");

const resetPasswordController = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  try {
    const { token, newpassword } = req.body;
    const secertKey = process.env.JWT_SECRET_KEY;
    const decodedValue = decodeToken(token, secertKey);
    const { email } = decodedValue;
    const existingUser = await User.findOne({ where: { email: email } });
    if (!existingUser) {
      return res
        .status(401)
        .send({ message: "User does not exist in the system" });
    }
    let hash = null;
    if (newpassword) {
      hash = bcrypt.hashSync(newpassword.toString(), 10);
    }
    await User.update({ password: hash }, { where: { email: email } });
    res.status(200).send({
        message:"Password resetted Successfully"
     });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error resetting password" });
  }
};

module.exports = resetPasswordController;
