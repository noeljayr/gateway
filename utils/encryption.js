//utils/encryption.js

const crypto = require("crypto");

const encrypt = (text) => {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(
    "376476efaac138b98fef1db0d836bda241cf7f0ba63cc733b5155014e2df6651",
    "hex"
  ); // Ensure key is 32 bytes
  const iv = Buffer.from("816e0b8e3180b6c767b182296a1222c5", "hex"); // Ensure IV is 16 bytes

  const secretKey = crypto.randomBytes(64).toString("hex");
  console.log("Your secret key:", secretKey);

  return encrypted;
};

module.exports = { encrypt };
