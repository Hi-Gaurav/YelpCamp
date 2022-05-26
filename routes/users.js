// const express = require('express');
// const User = require('../models/user');
// const router = express.Router();

const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { append } = require('express/lib/response');
//const users = require('../controllers/users');


///////////////////////////////////////////////////////////
//Register User Routes------------------------------->>>>
//////////////////////////////////////////////////////////


router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try{
    const{email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err =>{
        if(err) return next(err);
        req.flash('success', 'Welcome! Succesfully made a new account');
        res.redirect('/campgrounds')
    }) 
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register')
    }
}))

///////////////////////////////////////////////////////////
//Login Routes---------------------------------------->>>>
//////////////////////////////////////////////////////////

router.get('/login', async(req, res) =>{
    res.render('users/login')
})

router.post('/login',passport.authenticate('local', {failureFlash : true, failureRedirect : '/login'}), async(req, res) =>{
    req.flash('success', "Logged in succesfully!")
    res.redirect('/campgrounds')
})

router.get('/logout', (req, res) => {
    req.logout(err=>{
        if (err) { return next(err); }
        req.flash('success', 'You are logged out');
        res.redirect('/campgrounds');
      });
})

module.exports = router;