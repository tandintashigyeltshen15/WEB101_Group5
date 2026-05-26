const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  console.log("AUTH HEADER:", req.headers.authorization); // ← ADD THIS

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      
      console.log("REQ USER:", req.user); // ← ADD THIS
      
      return next();
    } catch (error) {
      console.log("JWT ERROR:", error.message); // ← ADD THIS
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  res.status(401).json({ message: "No token" });
};

module.exports = protect;