const router = require('express').Router();
const roles = require('../utils/roles')
const {user_register,user_login,user_auth,serialize_user,role_auth,update_user,change_password} = require("../utils/auth");
const Task = require("../models/Task");


router.get("/",user_auth,role_auth([roles.USER]),async (req,res) =>{
    return res.json(await Task.find({user:req.user._id}));
})

router.get("/:taskId",user_auth,role_auth([roles.USER]),async (req,res) =>{
    return res.json(await Task.find({_id:req.params.taskId}));
})

router.post("/",user_auth,role_auth([roles.USER]),async (req,res) =>{
    try {
        let task = new Task({
            ...req.body,
            user:req.user._id
        });
        let sTask = await task.save();
        return res.status(201).json({
            message: "Task Created Successfully.",
            success:true,
            task:sTask
        });   
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Couldn't create the task",
            success:false,
        });
    }

})
router.put("/:taskId",user_auth,role_auth([roles.USER]),async (req,res) =>{
    let task  = await Task.findById(req.params.taskId);
    let _task = req.body;
    task.title = _task.title || task.title;
    task.description = _task.description || task.description;
    task.target_date = _task.target_date || task.target_date;
    task.completed = _task.completed || task.completed;
    task.reminder = _task.reminder || task.reminder;
    await task.save();

    return res.status(201).json({
        message: "Task updated.",
        success:true,
        task
    });
})


module.exports = router;