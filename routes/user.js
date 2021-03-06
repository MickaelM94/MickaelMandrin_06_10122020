const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// // USERS
router.get('/users/:id', userCtrl.getOneUser);


module.exports = router;