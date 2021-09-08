const moment = require('moment');
const {Schema, model} = require('mongoose');
const TaskSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        target_date: {
            type: Date,
            required:true
        },
        date_created: {
            type: Date,
            default: moment.utc().valueOf()
        },
        completed: {
            type: Boolean,
            default: false
        },
        reminder: {
            type: Boolean,
            default: false
        },
        user:{type: Schema.Types.ObjectId, ref: 'users'}
    });
module.exports = model('tasks', TaskSchema);