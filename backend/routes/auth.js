const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Dhruvisagoodb$boy';

// ROUTE:1 Create a User using: POST "/api/auth/createUser"  No login required
router.post('/createUser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 8 characters').isLength({ min: 8 }),
], async (req, res) => {
  // If there are errors, return Bad request and th errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Check whether the user with this email exsists already 
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exsists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    });
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    

    // res.json({ user });
    res.json({authtoken});
    // Catch errors
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

// ROUTE:2  Authenticate a User using: POST "/api/auth/login"  No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password can not be blank').exists(),
], async (req, res) => {
  // If there are errors, return Bad request and th errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const{email, password} = req.body;
  try {
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({error: "Please try to login with correct Credentials"});
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      return res.status(400).json({error: "Please try to login with correct Credentials"});
    }
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({authtoken});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE:3 Get loggedIn User Details using: POST "/api/auth/getuser" login required
router.post('/getuser', fetchuser, async (req, res) => {
try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password");
  res.send(user);
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}
});
module.exports = router