const { body } = require("express-validator");

const validateUser = [
  body("username")
    .notEmpty().withMessage("Username is required.")
    .isLength({ min: 5 }).withMessage("Username must be at least 5 characters."),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 5 }).withMessage("Password must be at least 5 characters."),
  body("role")
    .notEmpty().withMessage("Role is required.")
    .isIn(["admin", "user"]).withMessage("Role must be 'admin' or 'user'."),
];

module.exports = {
  validateUser,
};
