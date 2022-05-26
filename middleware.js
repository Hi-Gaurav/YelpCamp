module.exports.isLoggedIn = (req, res, next) =>{
    if (!req.isAuthenticated()){
        // console.log(req.orignalUrl)
        // console.log(req.url)
        // console.log(req.orignalUrl)
        req.session.returnTo = req.orignalUrl
        req.flash('error', "Login/Sign Up First!");
        return res.redirect('/login');
    }
    next();
};