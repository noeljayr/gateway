// routes/merchant.js

const express = require('express');
const router = express.Router();
const Merchant = require('../models/MerchantModel');
const ApiKey = require('../models/APIKeyModel');
const { check, validationResult } = require('express-validator');
const generateApiKey = require('../utils/generateApiKey')

// Create a new merchant
router.post(
    '/create',
    [
        check('name').notEmpty().withMessage('Name is required'),
        check('website').isURL().withMessage('A valid website URL is required'),
        check('email').isEmail().withMessage('A valid email is required'),
        check('phone').notEmpty().withMessage('Phone number is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, website, email, phone } = req.body;

        try {
            // Check if merchant already exists
            let merchant = await Merchant.findOne({ email });
            if (merchant) {
                return res.status(400).json({ message: 'Merchant already exists' });
            }

            // Create a new merchant
            merchant = new Merchant({
                name,
                website,
                email,
                phone
            });

            await merchant.save();

            // Generate and save the API key
            const apiKeyValue = generateApiKey();
            const apiKey = new ApiKey({
                key: apiKeyValue,
                merchantId: merchant._id
            });

            await apiKey.save();

            res.status(201).json({ 
                message: 'Merchant created successfully', 
                merchant,
                apiKey: apiKeyValue
            });

        } catch (error) {
            console.error('Error creating merchant:', error.message);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);



module.exports = router;
