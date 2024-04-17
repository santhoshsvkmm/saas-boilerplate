const db = require("../../models");
const User = db.user;
const  {generateUrlToken} = require ("../../utils/token");
const sendEmail = require("../../middleware/email.middleware");
const generateForgotPasswordTemplate = require("../../emailTemplates/forgotPassword");


const forgotPasswordController = async (req, res) => {

    if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!",
        });
        return;
      }

    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if(!user){
            return res.status(401).send({ message: "Invalid Email Address" });
        }
        const {id,organisationId} = user.dataValues
        const expiresIn = '1h';
        const secertKey = process.env.JWT_SECRET_KEY;
        const urlToken = generateUrlToken({email,id,organisationId},secertKey , expiresIn);
        await sendEmail(email,"Password Resetting Request",generateForgotPasswordTemplate(urlToken));
        res.status(200).send({
             message:"Password reset link has been sent your email address"
          });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error resetting password" });
      }
};
  

module.exports = forgotPasswordController;

  