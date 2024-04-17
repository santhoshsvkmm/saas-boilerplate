const generateForgotPasswordTemplate = (resetLink) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password Email</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #666;">You have requested to reset your password. Please click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="color: #666;">If you did not request a password reset, please ignore this email.</p>
          <p style="color: #666;">Thank you,<br>Team [Your Company Name]</p>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = generateForgotPasswordTemplate;