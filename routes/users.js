const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const {User, validate} = require('../models/user');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//Get current user
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password'); // exclude password
    res.send(user);
});

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});

    if (user) return res.status(400).send('User already registered');

    user = new User(_.pick(req.body, ['name', 'email', 'password', 'isAdmin']));

    _.pick(user, ['name', 'email', 'isAdmin']);

    const salt = await bcrypt.genSalt(10); // the number of rounds to genereate the salt, the higer the number, the longer to generate , more complex, harder to break
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'isAdmin']));
});

module.exports = router;