const mongoose = require('mongoose');
const createError = require('http-errors');

module.exports = async function verifyToken(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw createError(401, 'Authorization Header Required');

    const accessToken = authorization.split(' ')[1];
    if (!accessToken || accessToken === 'undefined') {
      throw createError(401, 'Incorrect Token Format');
    }

    // fetch the session for the given accessToken
    const { userId, expires } = await mongoose.connection.db
      .collection('sessions')
      .findOne({ accessToken })
      .then(({ userId, expires }) => ({ userId, expires }));
    if (!userId || !expires) throw createError(400, 'Invalid Session');

    // check if the session has expired
    if (new Date(expires).valueOf() < new Date().valueOf()) {
      throw createError(400, 'Expired Session');
    }

    // we've found a valid session and will pass the userId down ...
    // ...to route controllers, if the routes uses this middleware
    res.locals.userId = userId;

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
