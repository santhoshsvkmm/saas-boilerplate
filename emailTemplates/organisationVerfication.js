
const organisationVerfication  = (token,data) => {
  const {organisationName} = data;
  const template =`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Verification Email</title>
  </head>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Verify Your Organization</h2>
      <p style="color: #666;">Dear ${organisationName},</p>
      <p style="color: #666;">Thank you for registering with our platform. To complete the verification process, please click the button below:</p>
      <a href="${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Verify Organization</a>
      <p style="color: #666;">Alternatively, you can use the following verification code: <strong>${token}</strong></p>
      <p style="color: #666;">If you did not register with us, please ignore this email.</p>
      <p style="color: #666;">Thank you,<br>Team [Your Company Name]</p>
    </div>
  </body>
  </html>`;

  return template;
}



module.exports = organisationVerfication;