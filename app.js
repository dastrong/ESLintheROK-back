require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const DEV_ENV = process.env.NODE_ENV === 'dev';
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

mongoose.set('debug', DEV_ENV);
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(cors(!DEV_ENV ? { origin: FRONTEND_URL } : {}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//load all the routes here
require('./routes')(app);

try {
  app.listen(PORT, () => console.log(`UP and RUNNING on port: ${PORT}`));
} catch (err) {
  console.error(err);
}
