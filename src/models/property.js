const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
    unitNumber: {type: String, required: [true, 'unit number is required'], unique: true},
    bedroom: {type: String, required: [true, 'number of bedrooms is required'],
        enum: ['One', 'Two', 'Three']},
    bath: {type: String, required: [true, 'number of bathrooms is required'],
        enum: ['One', 'Two']},
    squareFootage: {type: Number, required: [true, 'square footage is required']},
    monthlyRent: {type: Number, required: [true, 'monthly rent is required']},
    deposit: {type: Number, required: [true, 'security deposit is required']},
    status: {type: String, required: [true, 'status is required'], 
        enum: ['vacant', 'occupied', 'maintenance', 'reserved'], default: 'vacant'},
    images: {type: String, required: [true, 'at least one image is required']}, 
    active: {type: Boolean, default: true}
});



// 
module.exports = mongoose.model('Property', propertySchema);

