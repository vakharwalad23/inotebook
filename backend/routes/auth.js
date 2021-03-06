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
  body('birthdate', 'Birthdate must be entered').isLength({ min: 10 }),
  body('mobileno', 'Mobileno must be atleast 10 characters').isLength({ min: 10 , max:10 }),
  body('gender', 'Please enter gender'),
  body('bio', 'Bio must be atleast 8 characters').isLength({ min: 8 })
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and th errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  try {
    // Check whether the user with this email exsists already 
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: "Sorry a user with this email already exsists" })
    }
    let mono = await User.findOne({ mobileno: req.body.mobileno });
    if (mono) {
      return res.status(400).json({success, error: "Sorry a user with this mobile-number already exsists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      birthdate:req.body.birthdate,
      mobileno:req.body.mobileno,
      gender:req.body.gender,
      bio:req.body.bio,
      password: secPass
    });
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    

    // res.json({ user });
    success = true;
    res.json({success, authtoken});
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
  let success = false;
  // If there are errors, return Bad request and th errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const{email, password} = req.body;
  try {
    let user = await User.findOne({email});
    if(!user){
      success = false;
      return res.status(400).json({success, error: "Please try to login with correct Credentials"});
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      success = false;
      return res.status(400).json({success, error: "Please try to login with correct Credentials"});
    }
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authtoken});
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