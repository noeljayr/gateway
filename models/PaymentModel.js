const mongoose = require("mongoose");

// In models/PaymentModel.js
const PaymentSchema = new mongoose.Schema(
  {
    merchantId: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "MWK",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    customerEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true, // Enforce unique transactionId
    },
    cardNumber: {
      type: String,
      required: false,
    },
    expiryDate: {
      type: String,
      required: false,
    },
    cvv: {
      type: String,
      required: false,
    },
    holderName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
