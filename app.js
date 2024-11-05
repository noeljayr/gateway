// api/app.js

const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config");
const cors = require("cors");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allows cookies and other credentials to be sent
  })
);

connectDB();

// Routes
const paymentRoute = require("./routes/payment");
const merchantRoute = require("./routes/merchant");
const apiKeyRoute = require("./routes/apiKey");
const authRoute = require("./routes/auth");

app.use("/api/payment", paymentRoute);
app.use("/api/merchant", merchantRoute);
app.use("/api/api-key", apiKeyRoute);
app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("Payment Gateway API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
