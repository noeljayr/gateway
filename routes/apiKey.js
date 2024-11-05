const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ApiKey = require('../models/APIKeyModel');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

// Get all API keys for a merchant
router.get('/merchant/:merchantId', async (req, res) => {
    try {
        const { merchantId } = req.params;
        const apiKeys = await ApiKey.find({ merchantId });
        res.status(200).json(apiKeys);
    } catch (error) {
        console.error('Error fetching API keys:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//generate api key
router.post('/generate', apiKeyAuth, async (req, res) => {
    try {
        const merchantId = req.merchantId;

        // Generate a new API key
        const newApiKey = crypto.randomBytes(32).toString('hex');

        const apiKeyRecord = new ApiKey({
            merchantId: merchantId,
            key: newApiKey,
            status: 'active',
            usageCount: 0,
            createdAt: new Date(),
            lastUsed: null,
        });

        await apiKeyRecord.save();

        res.status(201).json({
            message: 'New API key generated successfully',
            apiKey: newApiKey,
        });
    } catch (error) {
        console.error('Error generating new API key:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update API key status (activate/deactivate)
router.patch('/status/:apiKeyId', async (req, res) => {
    try {
        const { apiKeyId } = req.params;
        const { status } = req.body;

        if (!['active', 'disabled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const apiKey = await ApiKey.findById(apiKeyId);
        if (!apiKey) {
            return res.status(404).json({ message: 'API key not found' });
        }

        apiKey.status = status;
        await apiKey.save();

        res.status(200).json({ message: 'API key status updated successfully' });
    } catch (error) {
        console.error('Error updating API key status:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;