//routes/payment.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { check, validationResult } = require("express-validator");
const { encrypt } = require("../utils/encryption");
const authMiddleware = require("../middlewares/authMiddleware");
const apiKeyAuth = require("../middlewares/apiKeyAuth");
const rateLimiter = require("../middlewares/rateLimiter");
const Payment = require("../models/PaymentModel");
const Customer = require("../models/CustomerModel");
const uuid = require("uuid");

// Apply the apiKeyAuth and rateLimiter middlewares to all routes
router.use(apiKeyAuth);
router.use(rateLimiter);
router.use(authMiddleware);

router.post(
  "/initiate",
  [
    check("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),
    check("email").isEmail().withMessage("Invalid email address"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        amount,
        currency,
        email,
        cardNumber,
        expiryDate,
        cvv,
        holderName,
      } = req.body;
      const merchantId = "66d9b8a6c1b0b5c766a91853";

      const transactionId = uuid.v4(); // Generate a unique transaction ID

      let customer = await Customer.findOne({ email });

      // Step 2: If the customer doesn't exist, create a new customer
      if (!customer) {
        customer = new Customer({ email });
        await customer.save();
      }

      const customerId = customer._id;
      // Step 3: Encrypt the necessary details for sending to Python backend
      const encryptedDetails = {
        amount: encrypt(amount.toString()),
        currency: encrypt(currency),
        customerId: encrypt(customerId.toString()),
        merchantId: merchantId,
        transactionId: transactionId,
        cardNumber: encrypt(cardNumber),
        expiryDate: encrypt(expiryDate),
        holderName: encrypt(holderName),
        cvv: encrypt(cvv),
      };

      // Step 4: Send the encrypted details to the Python backend
      const response = await axios.post(
        "http://localhost:5001/process-payment",
        encryptedDetails
      );

      if (response.status === 200) {
        const { transactionId, status, details, authorizationCode } =
          response.data;

        // Step 5: Save the payment in the MongoDB database with 'pending' status

        const payment = new Payment({
          merchantId,
          amount: encryptedDetails.amount,
          currency: encryptedDetails.currency,
          customerId,
          customerEmail: encrypt(email), // Store the email as well for easy lookup
          transactionId,
          status,
          holderName: encryptedDetails.holderName,
          cardNumber: encryptedDetails.cardNumber, // For simulation purposes
          expiryDate: encryptedDetails.expiryDate, // For simulation purposes
          cvv: encryptedDetails.cvv, // For simulation purposes
        });

        await payment.save();

        const responseData = {
          message: "Payment processed successfully",
          transactionId,
          status,
          details,
          authorizationCode,
        };
        console.log("Payment initiation success response:", responseData);
        return res.status(200).json(responseData);
      } else {
        console.log("Failed to initiate payment:", response.data);
        return res
          .status(response.status)
          .json({ message: "Failed to initiate payment" });
      }
    } catch (error) {
      console.error("Payment initiation error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Updated /payments route with sorting and search functionality
router.get("/payments", async (req, res) => {
  const { page = 1, limit = 10, sort = "desc", search = "" } = req.query;

  // Build the sort order based on createdAt and requested sort direction
  const sortOrder = sort === "asc" ? 1 : -1;

  // Build the search filter
  const searchFilter = {};
  if (search) {
    // Use regex for partial matching (case-insensitive)
    const searchRegex = new RegExp(search, "i");
    searchFilter.$or = [
      { amount: parseFloat(search) }, // Attempt to match as amount
      { customerEmail: searchRegex }, // Match by email
      { cardNumber: searchRegex }, // Match by card number
      { holderName: searchRegex }, // Match by holder name
    ];
  }

  try {
    // Query the database with pagination, sorting, and filtering
    const payments = await Payment.find(searchFilter)
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    // Count total payments for pagination
    const totalPayments = await Payment.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalPayments / limit);

    const responseData = {
      data: payments,
      page: parseInt(page),
      totalPages,
      totalPayments,
    };
    console.log("Payments fetch response:", responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get a payment by ID
router.get("/payments/:id", async (req, res) => {
  const { id } = req.params;

  // Check if the id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid payment ID:", id);
    return res.status(404).json({ message: "not found" });
  }

  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      console.log("Payment not found for ID:", id);
      return res.status(404).json({ message: "not found" });
    }

    console.log("Payment fetch by ID response:", payment);
    return res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment by ID:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-status/:transactionId", async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { transactionId: req.params.transactionId },
      { status },
      { new: true }
    );

    if (!payment) {
      console.log("Payment not found for transaction ID:", req.params.transactionId);
      return res.status(404).json({ message: "Payment not found" });
    }

    console.log("Payment status update response:", payment);
    return res.status(200).json(payment);
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
