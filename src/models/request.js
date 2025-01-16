const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    property: {type: Schema.Types.ObjectId, ref: 'Property',
        required: [true, 'unit reference is required']},
    tenant: {type: Schema.Types.ObjectId, ref: 'User',
        required: [true, 'tenant reference is required']},
    description: {type: String, required: [true, 'description is required'],
        minLength: [10, 'description must be at least 10 characters']},
    priority: {type: String,required: [true, 'priority level is required'],
        enum: ['low', 'medium', 'high', 'emergency'], default: 'low'},
    status: {type: String, required: [true, 'status is required'],
        enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending'},
    dateSubmitted: {type: Date, default: Date.now},
    dateCompleted: {type: Date},
    assignedTo: {type: Schema.Types.ObjectId, ref: 'User'},
    active: {type: Boolean, default: true}
});

// 
module.exports = mongoose.model('Request', requestSchema);