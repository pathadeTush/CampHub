if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate'); // to add boilerplate 
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const secret = process.env.SECRET_KEY;

// --------- Main Routes (Router) --------------------
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

//----------- mongoose setup ----------------------------------
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"; // cloud database || local database

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error!"));
db.once("open", () => {
  console.log("Database connected");
});

// ----------------- views/ejs ---------------------------------
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ------------------ mongoStore for sessions ----------------------
const MongoStore = require('connect-mongo');
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60, // To not to save unneccessary data when user refresh the page (sec)
})
store.on('error', function (e){
  console.log('SESSION STORE ERROR!', e);
})

const sessionConfig = {
  store,
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true, // if set true flash messages won't work
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // (msec)
    maxAge: 1000 * 60 * 60 * 24 * 7, //(msec)
  }
}
app.use(session(sessionConfig))
app.use(flash());
//------------ helmet configuration -------------------
app.use(helmet({ contentSecurityPolicy: false }));

// --------------- Allowed sources --------------------
const scriptSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://cdn.jsdelivr.net",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/tushar475/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//--------------------------------------------------------


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(mongoSanitize({
  replaceWith: '_' // to not allow $ or '.' character in query
}));

//----------------- middleware Global-------------------------------------
app.use((req, res, next) => {
  // console.log(req.query);
  // console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


//----------------- routing -------------------------------------------

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Default route
app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
})

// error handler
app.use((err, req, res, next) => {
  const { statusCode = 404 } = err;
  if (!err.message) err.message = 'Oh no, something went wrong';
  res.status(statusCode).render('error', { err });
})

app.listen(port, (req, res) => {
  console.log("serving on http://localhost:" + `${port}`);
});

/*
Note: For localhost Database is inserted from index.js file inside seeds directory
*/

// for image dataset
// https://source.unsplash.com/collection/455545

