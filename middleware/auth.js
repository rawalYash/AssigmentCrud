const jwt = require("jsonwebtoken");
const User = require("../model/user")

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.headers["authorization"] || req.params.token 

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRETE_KEY);
    const user = await User.findOne({where : {id : decoded.id}})
    if (!user) {
        return res.status(400).send({
            message: "Invalid User",
            status: 400
        });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

module.exports = verifyToken;