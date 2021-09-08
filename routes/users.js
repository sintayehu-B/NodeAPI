const router = require('express').Router();
const roles = require('../utils/roles')
const {user_register,user_login,user_auth,serialize_user,role_auth,update_user,change_password} = require("../utils/auth");
const User = require("../models/User")
router.post("/register-user",async (req,res) =>{
    return await user_register(req.body,roles.USER,res);
})

router.post("/login",async (req,res) =>{
    return await user_login(req.body,res);
})

router.get("/profile",user_auth,role_auth([roles.USER]),async (req,res) =>{
    return res.json(await User.findOne({_id:req.user._id}).select(["-password"]));
})
router.get("/current",user_auth,(req,res,next) =>{
    return res.json(serialize_user(req.user));
})
router.put('/update',user_auth,role_auth([roles.USER]), async(req, res,next) => {
    return await update_user(req.user._id,req.body,res);
})
router.put("/update-password",user_auth,role_auth([roles.USER]), async (req,res,next) =>{
    return await change_password(req.user._id,req.body.old_password,req.body.new_password,res);
})

module.exports = router;