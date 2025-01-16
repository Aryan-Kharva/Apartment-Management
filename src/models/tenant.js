const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tenantSchema = new Schema({
    unitNumber: {type: Schema.Types.ObjectId, ref: 'Property',
        required: [true, 'unit reference is required']},
    tenant: {type: Schema.Types.ObjectId, ref: 'User',
        required: [true, 'user reference is required']},
    moveInDate: {type: Date, required: [true, 'move in date is required']},
    employmentStatus: {type: String, required: [true, 'employement status is required'], 
        enum: ['Employed', 'Self-Employed', 'Student', 'Retired', 'Other']},
    annualIncome: {type: Number, required: [true, 'income is required']}, 
    additionalNotes: {type: String, default: 'None'}, 
    activeLease: {type: Boolean, default: false},
    leaseStart: {type: Date, default: null},
    leaseEnd: { type: Date, default: null},
    applicationDate: {type: Date, default: Date.now},
    applicationStatus: {type: String, enum: ['Pending', 'Approved', 'Declined'], default: 'Pending'},
    active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Tenant', tenantSchema);