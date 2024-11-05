// scripts/seedUsers.js

const mongoose = require('mongoose');
const User = require("../models/UserModel")
const Merchant = require('../models/MerchantModel');
const bcrypt = require('bcrypt');
const { request } = require('express');

// Replace with your MongoDB URI
const mongoURI = 'mongodb+srv://noeljayr01:thegamejr@mzunipay.oyy4a.mongodb.net/?retryWrites=true&w=majority&appName=mzunipay';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
    console.log("Connected to MongoDB");

    try {
        // Dummy merchants for users to be associated with
        const merchants = await Merchant.find(); // Assume you have merchant data already

        // Ensure we have at least one merchant for association
        if (merchants.length === 0) {
            console.log("No merchants found. Please add merchants before running this script.");
            return;
        }

        // Dummy user data
        const dummyUsers = [
            {
                name: "Alice Johnson",
                email: "alice@example.com",
                password: await bcrypt.hash("password123", 10), // hashed password
                merchants: [merchants[0]._id], 
                active: true
            },
            {
                name: "Bob Smith",
                email: "bob@example.com",
                password: await bcrypt.hash("password456", 10),
                merchants: [merchants[0]._id], 
                active: true
            },
            {
                name: "Carol Lee",
                email: "carol@example.com",
                password: await bcrypt.hash("password789", 10),           },
        ];

        // Insert users into the database
        await User.insertMany(dummyUsers);

        console.log("Dummy users inserted successfully!");
    } catch (error) {
        console.error("Error inserting dummy users:", error);
    } finally {
        mongoose.connection.close();
    }
});
