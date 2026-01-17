//middleware to check whether a user is signed in, if not then redirect to sign in page

const isSignedIn = (req, res, next) => {
    if (req.session && req.session.user) return next();
    res.redirect('/auth/sign-in');
};

module.exports = isSignedIn;
