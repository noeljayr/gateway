const jwt = require('jsonwebtoken');

// Middleware to extract merchant ID and check for admin status
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  const secretKey = '816e0b8e3180b6c767b182296a1222c5';

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  // Remove 'Bearer ' prefix if it exists
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Extract token by slicing off 'Bearer '
  }

  try {
    // Verify the token with the secret key
    const decoded = jwt.verify(token, secretKey);
    req.merchantId = decoded.merchantId;
    req.isAdmin = decoded.isAdmin; 

    next(); // Token is valid, proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
