const mongoose = require('mongoose'),
      Grade    = require('./grade'),
      Book     = require('./book'),
      Lesson   = require('./lesson'),
      DBurl    = process.env.NODE_ENV
                  ? `mongodb://${process.env.DBuser}:${process.env.DBpw}@${process.env.DBip}:${process.env.DBport}/${process.env.DBname}`
                  : 'mongodb://localhost:27017/lessons-api';
      
mongoose.set('debug', !process.env.NODE_ENV ? true : false);
mongoose.connect(DBurl, { useNewUrlParser: true });
mongoose.Promise = Promise;

module.exports = {Grade, Book, Lesson};