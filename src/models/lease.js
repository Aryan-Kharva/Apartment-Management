const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaseSchema = new Schema({
    property: {type: Schema.Types.ObjectId, ref: 'Property', required: [true, 'unit assignment is required']},
    leaseStart: {type: Date, required: [true, 'lease start date is required']},
    leaseEnd: {type: Date, required: [true, 'lease end date is required']},
    active: {type: Boolean, default: true}
});

// 
module.exports = mongoose.model('Lease', leaseSchema);

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/leases');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf')
        return cb(null, true);
    else
        cb(new Error('Invalid file type. Only PDF files are allowed.'), false)
}

module.exports.upload = multer({storage,
                        fileFilter,
                        limits: {fileSize: 5*1024*1024}
                    }).single('pdf');
                    