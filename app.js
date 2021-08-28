require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

const isDev = process.env.NODE_ENV === 'dev';
const port = process.env.PORT || 4000;
const DBurl = process.env.DBurl;

mongoose.set('debug', isDev);
mongoose.connect(DBurl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cookieParser());
app.use(
  cors({
    origin: 'https://eslintherok-dastrong.vercel.app',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//load all the routes here
require('./routes')(app);

try {
  app.listen(port, () => {
    console.log(`UP and RUNNING on port: ${port}`);
  });
} catch (err) {
  console.error(err);
}
