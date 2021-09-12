const User  = require("../models/User");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const jwt = require("jsonwebtoken");
const passport = require("passport");
const {SECRET} = require("../config");
/**
 * Register Users
 */
const user_register = async(user_dets,role,res) =>{
    try {
        // //Validate username
        let username_not_taken = await validate_username(user_dets.username);
        if(!username_not_taken){
            return res.status(400).json({
                message:'Username already taken.',
                success:false
            });
        }
        //Validate email
        let email_not_taken = await validate_email(user_dets.email);
        if(!email_not_taken){
            return res.status(400).json({
                message:'email already taken.',
                success:false
            });
        }

        const password = await bcrypt.hash(user_dets.password,12);

        //Create the user
        const new_user = new User({
            ...user_dets,
            date_created:moment.utc().valueOf(),
            role,
            password
        });
        let resp = await new_user.save();
        return res.status(201).json({
            message: "Registration successful.",
            success:true,
            user:serialize_user(resp)
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
           message: `unable to create your account`,
           success:false
        });
        // TODO Logging with winston
    }
}
/**
 * Login Users
 */
const user_login = async(user_creds,res) =>{
    let {username, password,email } = user_creds;
    // Check username or email
    const user = await User.findOne({$or:[{username: username},{email:email}]});
    if(!user){
        return res.status(404).json({
            message:`There is not an account with this email or username`,
            success: false
        });
    }
    let password_match = await  bcrypt.compare(password,user.password);
    if(password_match){
        let token = jwt.sign(
            {
                user_id : user._id,
                role: user.role,
                username: user.username,
                email: user.email,
                // password:user.password
            },SECRET,{expiresIn: "15 days" }
            );
            let result =  {
                username: user.username,
                role: user.role,
                email: user.email,
                // password:user.password,
                token:`Bearer ${token}`,
            expiryDate: moment().add(200, 'hours')
        }
        return res.status(200).json({
            ...result,
            message: `login successful`,
            success: true
        })
    }
    else{
        return res.status(403).json({
            message:`Invalid credentials!`,
            success: false
        });
    }
}
const validate_username = async username =>{
    let user  = await User.findOne({username});
    return user ? false : true;
}
const validate_email = async email =>{
    let user = await User.findOne({email});
    return user? false : true;
}
/**
 * Passport middleware
 */
const user_auth = passport.authenticate("jwt",{session:false});

/**
 *  Update User middleware
 */

 const update_user = async (id, _user,res) => {
    try {
        let user = await User.findById(id);
        //Validate username
        let username_not_taken = await validate_username(_user.username);
        if(!username_not_taken && user._id === id){
            return res.status(400).json({
                message:'Username already taken.',
                success:false
            });
        }
        //Validate email
        let email_not_taken = await validate_email(_user.email );
        if(!email_not_taken && user._id === id){
            return res.status(400).json({
                message:'email already taken.',
                success:false
            });
        }
        user.first_name = _user.first_name || user.first_name;
        user.last_name = _user.last_name || user.last_name;
        user.email = _user.email || user.email;
        user.username = _user.username || user.username;

        //...Add the rest like this
        await user.save()
        return res.status(200).json({
            message: `Records updated successfully.`,
            success: true,
            user:user
        })
    }
    catch (e){
        console.log(e);
        return res.status(500).json({
            message: `unable to update your account`,
            success:false
        });
        // TODO Logging with winston
    }
}


/**
 * Change Password
 */
 const change_password = async (id,old_password,new_password,res) => {
    // TODO Check password strength
    try {
        const user = await User.findById(id);
        let password_match = await bcrypt.compare(old_password,user.password);
        if(!password_match && new_password){
            //TODO Change this later on password strength check
            return res.status(403).json({
                message: `Incorrect Password.`,
                success: false
            });
        }
        else{
            user.password = await bcrypt.hash(new_password,12);
            await user.save()
            return res.status(200).json({
                message: `Password updated successfully.`,
                success: true
            });
        }
    }
    catch (e){
        console.log(e);
        return res.status(500).json({
            message: `unable to change your password.`,
            success:false
        });
        // TODO Logging with winston
    }
}

/**
 * Check role middleware
 */
const role_auth = roles => (req,res,next) =>{
    if(roles.includes(req.user.role)){
      return next();
    }
    return res.status(401).json({
        message: `Unauthorized.`,
        success: false
    })
}
const serialize_user = user => {
    return {
        role:user.role,
        verified: user.verified,
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        frist_name: user.frist_name,
        last_name: user.last_name
    }
};
module.exports = {update_user,change_password,user_register,user_login,user_auth,serialize_user,role_auth}