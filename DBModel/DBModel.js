const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema ({
    username: String,
    password: String
})

const usersMongo = mongoose.model("users", usersSchema);

module.exports = {usersMongo}
