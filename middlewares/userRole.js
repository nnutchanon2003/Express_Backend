// userRole.js
const isAdmin = async (req, res, next) => {
    const user = req.user;
    if (user.role === "admin") {
        next();
    } else {
        return res.status(403).send({
            message: "Permission denied: Admin role required."
        });
    }
};

const isUserOrAdmin = async (req, res, next) => {
    const user = req.user;
    if (user.role === "admin" || user.role === "user") {
        next();
    } else {
        return res.status(403).send({
            message: "Permission denied: User or Admin role required."
        });
    }
};

module.exports = {
    isAdmin,
    isUserOrAdmin
};
