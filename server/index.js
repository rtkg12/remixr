require('dotenv').config({ path: `${__dirname}/app.env` });

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

const api = require('./apiRoutes');

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static('build'));
app.use('/api', api);

app.get('*', function(req, res) {
  res.sendFile('./build/index.html', { root: __dirname });
});

app.listen(8080, function() {
  // eslint-disable-next-line no-console
  console.log('Spotify playlist generator started');
});
