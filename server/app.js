// #region Requires
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandleBars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const csrf = require('csurf');

const router = require('./router.js');
// #endregion

// #region Get env configs
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DomoMaker';
const redisURL = process.env.REDIS_URL || 'redis://default:6PMbcnFFM23iexPh3VLU9liXh888Levs@redis-11808.c9.us-east-1-4.ec2.cloud.redislabs.com:11808';
// #endregion

mongoose.connect(dbURI, (err) => {
  if (err) {
    console.error('[FATAL ERROR]: Could not connect to database');
    throw err;
  }
});

const redisClient = redis.createClient({
  legacyMode: true,
  url: redisURL,
});
redisClient.connect().catch((err) => {
  console.error('[FATAL ERROR]: Could not connect to redis');
  throw err;
});

// #region Express setup
const app = express();

// Statically serve the hosted directory as the assets route and set the favicon
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));

// Enable helper modules
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Setup handlebars
app.engine('handlebars', expressHandleBars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

// Setup sessions
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));

app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }
  console.log('Missing CSRF token!');
  return false;
});
// #endregion

router(app);

app.listen(port, (err) => {
  if (err) {
    console.error(`[FATAL ERROR]: Could not listen on port ${port}`);
    throw err;
  }
  console.log(`[SUCCESS]: Listening on port ${port}`);
});
