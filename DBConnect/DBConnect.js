const MongoStore = require('connect-mongo');

const storeMongo = MongoStore.create({ mongoUrl: process.env.MONGO_URI_SESSIONS});

module.exports = {storeMongo};
