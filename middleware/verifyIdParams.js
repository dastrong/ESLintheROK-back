const { isValidObjectId } = require('mongoose');
const createError = require('http-errors');

module.exports = async function verifyIdParams(req, res, next) {
  try {
    // get all param names, filter out non-id's, verify the key structure
    const everyParamIdIsValid = Object.keys(req.params)
      .filter(key => key.endsWith('Id'))
      .every(key => isValidObjectId(req.params[key]));

    // if any one of the id's are invalid we'll throw an error
    if (!everyParamIdIsValid) {
      throw createError(400, 'Invalid Id Structure');
    }

    // otherwise, we'll continue to request
    next();
  } catch (err) {
    next(err);
  }
};
