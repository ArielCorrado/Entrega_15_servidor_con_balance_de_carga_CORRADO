const MongoStore = require('connect-mongo');
const mongoose = require ("mongoose");
mongoose.set('strictQuery', true);

const storeMongo = MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1/sessions'});

mongoose.connect("mongodb://127.0.0.1:27017/users");

module.exports = {storeMongo};
