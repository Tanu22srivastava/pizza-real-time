require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const Emitter = require('events')

// Database connection
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
const store = new MongoDBStore({
  uri: url,
  collection: 'sessions',
});

// Handle session store errors
store.on('error', (error) => {
  console.log('Session store error:', error);
});

const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


// Session configuration
app.use(
  session({
    secret: process.env.COOKIE_SECRET || 'thisismysecret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json());
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');
app.use(expressLayout);

require('./routes/web')(app);

const server = app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});


const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})


eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
  io.to('adminRoom').emit('orderPlaced', data)
})
// var instance = new Razorpay({
//   key_id: 'rzp_test_kGQqQasUvj2gxR',
//   key_secret: 'F8Y0tURDOeuuRxIizod9vPKg',
// });

// // const Razorpay = require('razorpay');
// // var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

// // var options = {
// //   amount: req.body.amount,  // amount in the smallest currency unit
// //   currency: "INR",
// //   receipt: "order_rcptid_11"
// // };
// // instance.orders.create(options, function(err, order) {
// //   console.log(order);
// //   res.send({orderId:order_.id})
// // });