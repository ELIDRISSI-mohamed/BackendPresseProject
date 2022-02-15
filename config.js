
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'local',
    HOST : process.env.HOST || 'localhost',
    URL_MONGO : 'mongodb+srv://ELIDRISSI:vWeuyDlIC6WOnSZ5@cluster0.xhq17.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
}