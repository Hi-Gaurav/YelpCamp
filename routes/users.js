// const express = require('express');
// const User = require('../models/user');
// const router = express.Router();

const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
//const users = require('../controllers/users');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try{
    const{email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    //console.log(registeredUser);
    req.flash('success', 'Welcome! Succesfully made a new account');
    res.redirect('/campgrounds')
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register')
    }
}))

module.exports = router;