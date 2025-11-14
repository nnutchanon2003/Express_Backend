const passport = require("passport");

// Middleware ตรวจสอบ JWT Token
const checkToken = passport.authenticate("jwt-verify", { session: false });

// Middleware ตรวจสอบ Role
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        message: `Access denied. This action requires the "${requiredRole}" role.`,
      });
    }
    next();
  };
};

module.exports = {
  checkToken,
  checkRole,
};
