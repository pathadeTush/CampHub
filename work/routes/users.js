const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const passport = require('passport');


//------------ middleware -------------------------------------

//---------------- routes -----------------

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(users.login))

router.get('/logout', users.logout)

module.exports = router;

/**
 * 1. username: rohit    email: rohit@gmail.com   password: rohit
 * 2. username: virat    email: virat@gmail.com   password: virat
 * 3. username: suresh   email: suresh@gmail.com  password: suresh
 * 4. username: tony     email: tony@gmail.com    password: tony
 */