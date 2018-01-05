const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true },
    name: { type: String, require: true },
    password : { type : String , require : true }
});

module.exports = mongoose.model('User', userSchema);