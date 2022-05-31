if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { cookie } = require('express/lib/response');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const mongoDBStore = require('connect-mongo')(session)

const userRoutes = require('./routes/users');
// const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


//const dbURL = mongodb+srv://our-first-user:HIoTnShy5aLWpv8V@cluster0.ykhuj.mongodb.net/?retryWrites=true&w=majority
//const DbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize());


const secret = process.env.SECRET || 'thisshouldbesecret!';

const store = new mongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24*60*60
});


store.on("error", function(e){
  console.log('SESSION STORE ERROR', e)
})



const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 3600000 * 24 * 7,
    maxAge: 3600000 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
//app.use(helmet());






const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net", // add this one
  "https://kit-free.fontawesome.com/", // add this one
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
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
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/warrior100/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
      crossOriginEmbedderPolicy: false
  })
);








app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.query)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

/// //////////////////////////////////////////////////
// app.get('/fakeUser', async (req, res) =>{
//     const user = new User({email: 'abc@xyz.com', username : 'abc'})
//     const newUser = await(User.register(user, 'chicken'))
//     res.send(newUser);
// })
/// //////////////////////////////////////////////////

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use('/', userRoutes);

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});


const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
