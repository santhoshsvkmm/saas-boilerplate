const bidWinnerNotification = (supplierName, tenderTitle) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Congratulations, ${supplierName}!</h2>
      <p>We are pleased to inform you that your bid for the material tender titled "<strong>${tenderTitle}</strong>" has been accepted.</p>
      <p>Our procurement team will be in contact with you shortly to finalize the details and proceed with the purchase order.</p>
      <p>Thank you for your submission and we look forward to working with you.</p>
      <br>
      <p>Best regards,</p>
      <p>The Procurement Team</p>
    </div>
  `;
};

module.exports = bidWinnerNotification;