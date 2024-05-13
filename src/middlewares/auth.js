const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET_KEY } = require("../config/server.config");

const authenticate = async (req, res, next) => {
  console.log("Authentication api hit");
  console.log("Header author", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    console.log("token", token);
    const decodedToken = jwt.verify(token, SECRET_KEY);
    console.log("decode token", decodedToken);
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract officeName from the request parameters
    const officeName = req.query.officeName;
    if (!officeName) {
      return res.status(400).json({ message: "Office name is required" });
    }

    // Check if the user has access to the specified office
    const office = await User.findOne({ office: officeName });
    if (!office) {
      return res
        .status(403)
        .json({ message: "User does not have access to this office" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate };
