const generatePasswordResetNotificationTemplate = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Notification</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Notification</h2>
          <p style="color: #666;">Your password has been recently reset.</p>
          <p style="color: #666;">If you did not reset your password, please contact us immediately.</p>
          <p style="color: #666;">Thank you,<br>Team [Your Company Name]</p>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = generatePasswordResetNotificationTemplate;