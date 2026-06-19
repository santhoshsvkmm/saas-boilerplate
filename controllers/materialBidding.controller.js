const db = require("../models");
const MaterialBidding = db.materialBidding;
const Op = db.Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const logger = require('../loggers/logger');
const { clearCacheByTag } = require('../utils/cache.util');
const sendEmail = require('../services/email.services');
const bidWinnerNotification = require('../emailTemplates/bidWinnerNotification');

// Create and Save a new Bid
exports.create = catchAsync(async (req, res) => {
  const data = await MaterialBidding.create(req.body);
  logger.info(`Bid created successfully with ID: ${data.id} for tender ID: ${data.material_tender_id}`);
  await clearCacheByTag(`tender:${data.material_tender_id}`);
  res.status(201).send(data);
});

// Retrieve all Bids for a specific Tender
exports.findAllByTender = catchAsync(async (req, res) => {
  const tenderId = req.params.id;
  logger.info(`Retrieving all bids for tender ID: ${tenderId}`);
  const data = await MaterialBidding.findAll({
    where: { material_tender_id: tenderId, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Find a single Bid with an id
exports.findOne = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Retrieving bid with ID: ${id}`);
  const data = await MaterialBidding.findOne({
    where: { id: id, isDeleted: { [Op.ne]: true } }
  });
  res.send(data);
});

// Update a Bid by the id in the request
exports.update = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to update bid with ID: ${id}`);

  const bid = await MaterialBidding.findByPk(id);
  if (!bid) {
    return res.status(404).send({ message: `Cannot find Bid with id=${id}.` });
  }

  const [num] = await MaterialBidding.update(req.body, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Bid updated successfully with ID: ${id}`);
    await clearCacheByTag(`tender:${bid.material_tender_id}`);
    res.send({
      message: "Bid was updated successfully."
    });
  } else {
    res.send({
      message: `Cannot update Bid with id=${id}. Maybe it was not found or req.body is empty!`
    });
  }
});

// Delete a Bid with the specified id in the request
exports.delete = catchAsync(async (req, res) => {
  const id = req.params.id;
  logger.info(`Attempting to soft-delete bid with ID: ${id}`);

  const bid = await MaterialBidding.findByPk(id);
  if (!bid) {
    return res.status(404).send({ message: `Cannot find Bid with id=${id}.` });
  }

  const [num] = await MaterialBidding.update({ isDeleted: true }, {
    where: { id: id }
  });

  if (num == 1) {
    logger.info(`Bid soft-deleted successfully with ID: ${id}`);
    await clearCacheByTag(`tender:${bid.material_tender_id}`);
    res.send({ message: "Bid was deleted successfully!" });
  } else {
    res.send({ message: `Cannot delete Bid with id=${id}.` });
  }
});

// Accept a Bid and reject others for the same tender
exports.accept = catchAsync(async (req, res) => {
  const { id } = req.params;
  const t = await db.sequelize.transaction();

  try {
    const acceptedBid = await MaterialBidding.findByPk(id, {
      include: [
        {
          model: db.supplier,
          attributes: ['email', 'contact_person_firstname']
        },
        { model: db.materialTender, attributes: ['title'] }
      ],
      transaction: t
    });

    if (!acceptedBid) {
      await t.rollback();
      return res.status(404).send({ message: `Bid with id=${id} not found.` });
    }

    const tenderId = acceptedBid.material_tender_id;

    // 1. Reject all other bids for this tender
    await MaterialBidding.update(
      { status: 'rejected' },
      { where: { material_tender_id: tenderId, id: { [Op.ne]: id } }, transaction: t }
    );

    // 2. Accept the selected bid
    acceptedBid.status = 'accepted';
    await acceptedBid.save({ transaction: t });

    // 3. Update the parent tender's status to 'awarded'
    await db.materialTender.update(
      { status: 'awarded' },
      { where: { id: tenderId }, transaction: t }
    );

    await t.commit();

    // Send email notification to the winning supplier
    if (acceptedBid.supplier && acceptedBid.supplier.email) {
      await sendEmail(
        acceptedBid.supplier.email,
        `Congratulations! Your Bid for "${acceptedBid.materialTender.title}" has been Accepted`,
        bidWinnerNotification(acceptedBid.supplier.contact_person_firstname, acceptedBid.materialTender.title)
      );
      logger.info(`Sent bid acceptance email to ${acceptedBid.supplier.email}`);
    }

    logger.info(`Bid ID ${id} accepted. Tender ID ${tenderId} has been awarded.`);
    await clearCacheByTag(`tender:${tenderId}`);
    res.status(200).send({ message: 'Bid accepted successfully.' });
  } catch (error) {
    await t.rollback();
    throw error; // Pass error to the centralized error handler
  }
});