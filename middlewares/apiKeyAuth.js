const ApiKey = require("../models/APIKeyModel.js");

async function apiKeyAuth(req, res, next) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ message: "API key is missing" });
  }

  try {
    const keyRecord = await ApiKey.findOne({ key: apiKey, status: "active" });

    if (!keyRecord) {
      return res.status(403).json({ message: "Invalid or disabled API key" });
    }

    // Safeguard: Ensure req.route is defined
    const endpoint = req.originalUrl;

    // Increment usage count
    keyRecord.usageCount += 1;
    keyRecord.lastUsed = new Date();

    // Track usage per endpoint
    keyRecord.endpointUsage.set(
      endpoint,
      (keyRecord.endpointUsage.get(endpoint) || 0) + 1
    );

    await keyRecord.save();

    req.merchantId = keyRecord.merchantId;
    next();
  } catch (error) {
    console.error("API key validation error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = apiKeyAuth;
