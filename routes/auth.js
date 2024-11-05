// auth.js

const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  // Check if the user exists, is active, and the password is correct
  if (!user || !user.active || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials or user is not active" });
  }

  // Get merchantId and generate a token
  const merchantId = user.merchants[0];
  const token = jwt.sign(
    { userId: user._id, merchantId: merchantId.toString() },
    "816e0b8e3180b6c767b182296a1222c5",
    { expiresIn: "1000h" }
  );

  // Respond with the generated token
  res.json({ token });
});

module.exports = router;
