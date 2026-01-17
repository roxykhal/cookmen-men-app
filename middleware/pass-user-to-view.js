//logic that assigns req.session.user to res.locals.user so we can use it in Views

const passUserToView = (req, res, next) => {
    // ternary operator, if no user is found, we set it to null
    res.locals.user = req.session && req.session.user ? req.session.user : null;
    // move to the next middleware
    next();
};

module.exports = passUserToView;
