require('dotenv').config
const express = require('express')
const app=express()
const PORT=process.env.PORT || 3000
const ejs= require('ejs')
const expressLayout=require('express-ejs-layouts')
const path =require('path')

const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore= require('connect-mongo')(session);

//database connection
const url = 'mongodb://127.0.0.1/pizza';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;

connection.on('error', (err) => {
  console.log('Connection failed...', err);
});

connection.once('open', () => {
  console.log('Database connected...');
});

// Session store
let mongoStore = new MongoDbStore({
    //mongoUrl: url,
    mongooseConnection: connection,
    collection: 'sessions'
})


// session configuration
app.use(session({
    secret: 'thisismysecret',
    resave:false,
    saveUninitialized:false,
    store:mongoStore,
    cookie: {maxAge: 1000*60860*24}
    
}))
app.use(flash())


app.use(express.static('public'))
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)

app.listen(PORT, ()=>{
    console.log("chl jana bhai pleaseeee naaa")
})