const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApiKeySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "disabled"],
    default: "active",
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endpointUsage: { type: Map, of: Number, default: {} },
  lastUsed: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ApiKey", ApiKeySchema);
