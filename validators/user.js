const { body } = require("express-validator");

const createUser = [
    body("username")
        .notEmpty().withMessage("Username is required.")
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long."),
    body("password")
        .notEmpty().withMessage("Password is required.")
        .isLength({ min: 5 }).withMessage("Password must be at least 5 characters long."),
    body("role")
        .notEmpty().withMessage("Role is required.")
        .isIn(["admin", "user"]).withMessage("Role must be either 'admin' or 'user'."),
];

const updateUser = [
    body("username")
        .optional()
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long."),
    body("password")
        .optional()
        .isLength({ min: 5 }).withMessage("Password must be at least 5 characters long."),
    body("role")
        .optional()
        .isIn(["admin", "user"]).withMessage("Role must be either 'admin' or 'user'."),
];

module.exports = {
    createUser,
    updateUser,
}