const cors = require('cors');
const express = require('express');
const passport = require("passport");
const bp = require('body-parser');
const {connect} = require('mongoose');
const {success, error } = require('consola');
//
const { DB , PORT} = require("./config/index");
// Initialize
const app = express();

//Middlewares
app.use(cors());
app.use(bp.json());
app.use(passport.initialize());

require("./middlewares/passport")(passport);
//Routes
app.use('/api/users',require('./routes/users'));
app.use('/api/tasks',require('./routes/tasks'));
//Configure the database connection
const connect_app = connect(DB,
    {useFindAndModify:true,
        useUnifiedTopology:true,
        useNewUrlParser:true})
    .then(() =>{
        success({message:`Successfully connected with the database@ ${DB}`,badge:true});
    })
    .catch(err=> error({message:"Error connecting to the database"}));

app.listen(PORT,()=>{
    success({message:`server started on port ${PORT}`,badge:true});
});