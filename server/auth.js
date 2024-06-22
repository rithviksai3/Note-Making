const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router()
const User =require('./models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
var JWT_SECRET = 'rickyrocky$s'
var fetchuser = require('./middleware/fetchuser')
//create a user using :post "/api/auth"
router.post('/createuser',[
    body('name','enter valid name').isLength({min:3}),
    body('email','enter valid email').isEmail(),
    body('password','enter valid password').isLength({min:5}),
],async (req,res)=>{
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()});
    }
    //check whether user exists already
    try{
    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success,error:"user already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);
    //create  a new user
    user = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:secPass,
    })
    const data={
        user:{
          id:user.id,
        }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authtoken}) 
   }catch(error){
      console.log(error.message);
      res.status(500).send("internal server error occurred");
   }
})

//authenticate user
router.post('/login',[
    body('email','enter valid email').isEmail(),
    body('password','password cannot be blank').exists(),
],async (req,res)=>{
    let success=false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors:errors.array()});
    } 
    const {email,password} =req.body;
    try{
       let user = await User.findOne({email});
       if(!user){
        success=false
        return res.status(400).json({error:"invalid credentials"});
       }
       const passwordCompare = await bcrypt.compare(password,user.password);
       if(!passwordCompare){
        success=false
        return res.status(400).json({success,error:"invalid credentials"});
       }
       const data={
        user:{
          id:user.id,
        }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    success=true
    res.json({success,authtoken})
    }catch(error){
        console.log(error.message);
        res.status(500).send("internal server error occurred");
    }
})

//get logged in user details
router.post('/getuser',fetchuser,async (req,res)=>{
try{
    userId=req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
}catch(error){
    console.error(error.message)
    res.status(500).send("internal server error");
}
})
module.exports = router