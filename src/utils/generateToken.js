const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const JWT_EXPIRE = "30d";
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

module.exports = generateToken;
