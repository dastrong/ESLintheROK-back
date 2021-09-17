const createError = require('http-errors');
const gradeRoutes = require('./grades');
const bookRoutes = require('./books');
const lessonRoutes = require('./lessons');
const fontRoutes = require('./fonts');
const pastLessonRoutes = require('./pastlessons');

module.exports = app => {
  app.use('/api', gradeRoutes);
  app.use('/api', bookRoutes);
  app.use('/api', lessonRoutes);
  app.use('/api', fontRoutes);
  app.use('/api', pastLessonRoutes);

  //catches all endpoints that don't exist above
  app.use((req, res, next) =>
    next(createError(404, `Invalid URL: ${req.url}`))
  );

  //catches all errors passed through next()
  app.use((err, req, res, next) => {
    const status = err.status || 400;
    const message = err.message || 'Unknown Error';
    res.status(status).json({ message });
  });
};
