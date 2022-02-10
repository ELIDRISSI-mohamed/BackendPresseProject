const config =  require('./config.js');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http')
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');
const path = require('path');
//const {server} = require('socket.io');


const port = 3333

var clientRouter = require('./routes/ClientRouter');
var adminRouter = require('./routes/AdminRouter');
var collaborateurRouter = require("./routes/CollaborateurRouter");
var redacteurRouter = require("./routes/RedacteurRouter");
var traducteurRouter = require("./routes/TraducteurRouter");
var correcteurRouter = require("./routes/CorrecteurRouter");

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.resolve('./public')));
dotenv.config();

//const url = 'mongodb://localhost:27017';
//const url = `mongodb+srv://ELIDRISSI:vWeuyDlIC6WOnSZ5@cluster0.xhq17.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const server = http.createServer(app)

MongoClient.connect(config.URL_MONGO, { useUnifiedTopology: true }, function (err, db) {
    if (err) {
		throw err;
	} else {
        console.log("Connected");
        global.dbo = db.db('PresseProject');
    }
});


app.use('/admin', adminRouter);
app.use('/collaborateur', collaborateurRouter);
app.use('/user', clientRouter);
app.use('/redacteur', redacteurRouter);
app.use('/traducteur', traducteurRouter);
app.use('/correcteur', correcteurRouter);

server.listen(port, ()=>{
    console.log(`app listening at port: ${port}`)
})

module.exports = app;
 