const router = require('express').Router();
const createError = require('http-errors');
const { isValidObjectId } = require('mongoose');
const { customAlphabet } = require('nanoid/async');

const PastLesson = require('../models/pastlesson');
const verifyToken = require('../middleware/verifyToken');
const verifyIdParams = require('../middleware/verifyIdParams');

const newExpire = 1000 * 60 * 60 * 24 * 182; // half year in ms
const alphabet = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

router.get('/past-lesson', verifyToken, getUserPastLessons);
router.post('/past-lesson', verifyToken, createPastLesson);
router.post('/past-lesson/bulk', getPastLessonsData);
router.get('/past-lesson/id/:pastLessonId', verifyIdParams, getPastLessonById);
router.get('/past-lesson/shortId/:pastLessonShortId', getPastLessonByShortId);
router.put(
  '/past-lesson/:pastLessonId',
  verifyIdParams,
  verifyToken,
  updatePastLesson
);
router.delete(
  '/past-lesson/:pastLessonId',
  verifyIdParams,
  verifyToken,
  deletePastLesson
);
router.put(
  '/past-lesson/:pastLessonId/expiry',
  verifyIdParams,
  updatePastLessonExpiry
);
router.get(
  '/past-lesson/:pastLessonId/shortId',
  verifyIdParams,
  verifyToken,
  getPastLessonShortId
);

async function getUserPastLessons(req, res, next) {
  try {
    const { userId } = res.locals;

    const pastLessons = await PastLesson.find({ ownerId: userId }).lean();
    if (!pastLessons) {
      throw createError(400, "Error finding that user's past lessons");
    }

    res.status(200).json(
      pastLessons.map(
        ({
          _id,
          title,
          vocabulary,
          expressions,
          expires,
          createdAt,
          shortId,
        }) => ({
          _id,
          title,
          vocabularyCount: vocabulary.length,
          expressionsCount: expressions.length,
          expires,
          createdAt,
          shortId,
        })
      )
    );
  } catch (err) {
    next(err);
  }
}

async function createPastLesson(req, res, next) {
  try {
    const { userId } = res.locals;
    const { title, vocabulary, expressions } = req.body;
    if (!title) {
      throw createError(400, 'Error creating past lesson (title)');
    }
    if (!vocabulary) {
      throw createError(400, 'Error creating past lesson (vocabulary)');
    }
    if (!expressions) {
      throw createError(400, 'Error creating past lesson (expressions)');
    }

    const newPastLesson = await PastLesson.create({
      title,
      vocabulary,
      expressions,
      ownerId: userId,
    });

    res.status(201).json(newPastLesson);
  } catch (err) {
    next(err);
  }
}

async function getPastLessonsData(req, res, next) {
  try {
    const { pastLessonIds } = req.body;
    if (!pastLessonIds) {
      throw createError(400, 'Error getting past lessons (pastLessonIds)');
    }
    if (!Array.isArray(pastLessonIds)) {
      throw createError(
        400,
        'Error getting past lessons (pastLessonIds should be an array)'
      );
    }
    if (!pastLessonIds.every(isValidObjectId)) {
      throw createError(
        400,
        'Error getting past lessons (Invalid Id Structure)'
      );
    }

    const pastLessons = await PastLesson.find({ _id: { $in: pastLessonIds } });
    if (!pastLessons.length) {
      throw createError(400, `Error finding those past lessons`);
    }

    // combine all the lessons data together
    let vocabulary = [];
    let expressions = [];
    pastLessons.forEach(lesson => {
      vocabulary.push(...lesson.vocabulary);
      expressions.push(...lesson.expressions);
    });

    res.status(200).json({ vocabulary, expressions });
  } catch (err) {
    next(err);
  }
}

async function getPastLessonById(req, res, next) {
  try {
    const { pastLessonId } = req.params;

    const pastLesson = await PastLesson.findOne({ _id: pastLessonId });
    if (!pastLesson) {
      throw createError(400, `Error finding past lesson (${pastLessonId})`);
    }

    // remove ownerId from object before returning
    const { ownerId, __v, ...returnableLesson } = pastLesson._doc;

    res.status(200).json(returnableLesson);
  } catch (err) {
    next(err);
  }
}

async function getPastLessonByShortId(req, res, next) {
  try {
    const { pastLessonShortId } = req.params;

    const pastLesson = await PastLesson.findOne({ shortId: pastLessonShortId });
    if (!pastLesson) {
      throw createError(400, `Error finding lesson (${pastLessonShortId})`);
    }

    // remove ownerId from object before returning
    const { ownerId, __v, ...returnableLesson } = pastLesson._doc;

    res.status(200).json(returnableLesson);
  } catch (err) {
    next(err);
  }
}

async function updatePastLesson(req, res, next) {
  try {
    const { userId } = res.locals;
    const { pastLessonId } = req.params;
    const { title, vocabulary, expressions } = req.body;
    if (!title) {
      throw createError(400, 'Error updating past lesson (title)');
    }
    if (!vocabulary) {
      throw createError(400, 'Error updating past lesson (vocabulary)');
    }
    if (!expressions) {
      throw createError(400, 'Error updating past lesson (expressions)');
    }

    const updatedPastLesson = await PastLesson.findOneAndUpdate(
      { _id: pastLessonId, ownerId: userId },
      { title, vocabulary, expressions, expires: Date.now() + newExpire },
      { new: true }
    );
    if (!updatedPastLesson) {
      throw createError(
        400,
        `Error finding past lesson to update (${pastLessonId})`
      );
    }

    // remove ownerId from object before returning
    const { ownerId, __v, ...returnableLesson } = pastLesson._doc;

    res.status(200).json(returnableLesson);
  } catch (err) {
    next(err);
  }
}

async function deletePastLesson(req, res, next) {
  try {
    const { userId } = res.locals;
    const { pastLessonId } = req.params;

    const deletedPastLesson = await PastLesson.findOneAndDelete({
      _id: pastLessonId,
      ownerId: userId,
    });
    if (!deletedPastLesson) {
      throw createError(400, `Error deleting past lesson (${pastLessonId})`);
    }

    res.status(200).json({ message: 'Successfully Deleted' });
  } catch (err) {
    next(err);
  }
}

async function updatePastLessonExpiry(req, res, next) {
  try {
    const { pastLessonId } = req.params;

    const updatedPastLesson = await PastLesson.findOneAndUpdate(
      { _id: pastLessonId },
      { expires: Date.now() + newExpire },
      { new: true }
    );
    if (!updatedPastLesson) {
      throw createError(
        400,
        `Error finding past lesson to update (${pastLessonId})`
      );
    }

    res.status(204);
  } catch (err) {
    next(err);
  }
}

async function getPastLessonShortId(req, res, next) {
  try {
    const { userId } = res.locals;
    const { pastLessonId } = req.params;

    const pastLesson = await PastLesson.findOne({
      _id: pastLessonId,
      ownerId: userId,
    });
    if (!pastLesson) {
      throw createError(
        400,
        `Error finding past lesson to update (${pastLessonId})`
      );
    }

    // if there isn't a shortId, we'll need to add one
    if (!pastLesson.shortId) {
      pastLesson.shortId = await nanoid();
      await pastLesson.save();
    }

    res.status(200).json({ shortId: pastLesson.shortId });
  } catch (err) {
    next(err);
  }
}

module.exports = router;
