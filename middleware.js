module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to log in first!')
        return res.redirect('/login')
    } else {
        next();
    }
}

