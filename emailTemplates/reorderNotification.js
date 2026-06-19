const reorderNotification = (materialName, currentStock, reorderLevel) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Low Stock Alert</h2>
      <p>This is an automated notification to inform you that the stock for the following material is running low:</p>
      <ul>
        <li><strong>Material:</strong> ${materialName}</li>
        <li><strong>Current Stock:</strong> ${currentStock}</li>
        <li><strong>Reorder Level:</strong> ${reorderLevel}</li>
      </ul>
      <p>Please initiate the reordering process to avoid stockouts.</p>
      <br>
      <p>Thank you,</p>
      <p>Inventory Management System</p>
    </div>
  `;
};

module.exports = reorderNotification;