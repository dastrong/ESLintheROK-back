const router = require('express').Router();
const createError = require('http-errors');
const PastLesson = require('../models/pastlesson');
const verifyToken = require('../middleware/verifyToken');
const verifyIdParams = require('../middleware/verifyIdParams');

const newExpire = 1000 * 60 * 60 * 24 * 182; // half year in ms

router.get('/past-lesson', verifyToken, getUserPastLessons);
router.post('/past-lesson', verifyToken, createPastLesson);
router.get('/past-lesson/:pastLessonId', verifyIdParams, getPastLesson);
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

async function getUserPastLessons(req, res, next) {
  try {
    const { userId } = res.locals;

    const pastLessons = await PastLesson.find({ ownerId: userId }).lean();
    if (!pastLessons) {
      throw createError(400, "Error finding that user's past lessons");
    }

    res.status(200).json(
      pastLessons.map(
        ({ _id, vocabulary, expressions, expires, createdAt }) => ({
          _id,
          vocabularyCount: vocabulary.length,
          expressionsCount: expressions.length,
          expires,
          createdAt,
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
    const { vocabulary, expressions } = req.body;
    if (!vocabulary) {
      throw createError(400, 'Error creating past lesson (vocabulary)');
    }
    if (!expressions) {
      throw createError(400, 'Error creating past lesson (expressions)');
    }

    const newPastLesson = await PastLesson.create({
      vocabulary,
      expressions,
      ownerId: userId,
    });

    res.status(201).json(newPastLesson);
  } catch (err) {
    next(err);
  }
}

async function getPastLesson(req, res, next) {
  try {
    const { pastLessonId } = req.params;

    const pastLesson = await PastLesson.findOne({ _id: pastLessonId })
      .select('vocabulary expressions')
      .lean();
    if (!pastLesson) {
      throw createError(400, `Error finding past lesson (${pastLessonId})`);
    }

    res.status(200).json(pastLesson);
  } catch (err) {
    next(err);
  }
}

async function updatePastLesson(req, res, next) {
  try {
    const { userId } = res.locals;
    const { pastLessonId } = req.params;
    const { vocabulary, expressions } = req.body;
    if (!vocabulary) {
      throw createError(400, 'Error updating past lesson (vocabulary)');
    }
    if (!expressions) {
      throw createError(400, 'Error updating past lesson (expressions)');
    }

    const updatedPastLesson = await PastLesson.findOneAndUpdate(
      { _id: pastLessonId, ownerId: userId },
      { vocabulary, expressions, expires: Date.now() + newExpire },
      { new: true }
    );
    if (!updatedPastLesson) {
      throw createError(
        400,
        `Error finding past lesson to update (${pastLessonId})`
      );
    }

    res.status(200).json(updatedPastLesson);
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

    res.status(200).json(deletedPastLesson);
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

    res.status(200).json(updatedPastLesson);
  } catch (err) {
    next(err);
  }
}

module.exports = router;
