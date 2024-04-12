const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateJwtSecretKey = (length) => {
    return crypto.randomBytes(length).toString('hex');
  };
  

const generateUrlToken = (payload, secretKey, expiresIn) => {
    const token = jwt.sign(payload, secretKey, { expiresIn });
    const urlToken = encodeURIComponent(token); // Encode the token for URL safety
    return urlToken;
  };
  

  const decodeToken = (token, secretKey) => {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw new Error('Token decoding failed');
    }
};
  

  module.exports = {
    generateJwtSecretKey,generateUrlToken,decodeToken
  }
