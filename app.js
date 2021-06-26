require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const bodyParser = require('body-parser');
const gradeRoutes = require('./routes/gradesR');
const bookRoutes = require('./routes/booksR');
const lessonRoutes = require('./routes/lessonsR');

const isDev = process.env.NODE_ENV === 'dev';
const port = process.env.PORT || 4000;
const DBurl = process.env.DBurl;

mongoose.set('debug', isDev);
mongoose.connect(DBurl, { useNewUrlParser: true });
mongoose.Promise = Promise;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('ESL in the ROK API Main Page'));
app.use('/api', gradeRoutes);
app.use('/api/:gradeID/:bookID', bookRoutes);
app.use('/api/:gradeID/:bookID', lessonRoutes);

try {
  app.listen(port, () => {
    console.log(`UP and RUNNING on port: ${port}`);
  });
} catch (err) {
  console.error(err);
}
