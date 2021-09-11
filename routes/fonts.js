const router = require('express').Router();
const createError = require('http-errors');
const mongoose = require('mongoose');
const Font = require('../models/font');
const verifyToken = require('../middleware/verifyToken');

router.get('/fonts', verifyToken, getUserFonts);
router.post('/fonts', verifyToken, addFont);
router.delete('/fonts', verifyToken, removeFont);
router.post('/fonts/user/default', verifyToken, chooseDefaultFont);

async function getUserFonts(req, res, next) {
  try {
    const { userId } = res.locals;

    const fonts = await Font.find({ userIds: userId })
      .select('name fallback')
      .lean();
    if (!fonts) throw createError(400, 'Error finding user fonts');

    res.status(200).json(fonts);
  } catch (err) {
    next(err);
  }
}

async function addFont(req, res, next) {
  try {
    const { userId } = res.locals;
    const { name, fallback } = req.body;
    if (!name) {
      throw createError(400, 'Error adding font (missing name)');
    }
    if (!fallback) {
      throw createError(400, 'Error adding font (missing fallback)');
    }

    // check if the font has already been added
    const font = await Font.findOne({ name });

    if (font) {
      // check if the user has already selected this font
      // ... otherwise, we will add and save the font
      if (font.userIds.includes(userId)) {
        throw createError(400, 'Already added that font');
      } else {
        font.userIds.push(userId);
        const updatedFont = await font.save();
        res.status(200).json(updatedFont);
      }
    } else {
      // the font doesn't exist, so create it and add the userId to it
      const newFont = await Font.create({
        name,
        fallback,
        userIds: [userId],
      });
      return res.status(201).json(newFont);
    }
  } catch (err) {
    next(err);
  }
}

async function removeFont(req, res, next) {
  try {
    const { userId } = res.locals;
    const { _id } = req.body;

    const font = await Font.findOne({ _id });
    if (!font) throw createError(400, `Error deleting font (${_id})`);

    // take out the user's id
    const filteredUserIds = font.userIds.filter(
      id => id.toString() !== userId.toString()
    );

    // check if there are still user's using the given font
    // ... if there isn't we'll delete it
    // ... otherwise, we'll update userIds and save it
    if (filteredUserIds.length) {
      font.userIds = filteredUserIds;
      const updatedFont = await font.save();
      res.status(200).json(updatedFont);
    } else {
      const updatedFont = await font.remove();
      res.status(200).json(updatedFont);
    }
  } catch (err) {
    next(err);
  }
}

async function chooseDefaultFont(req, res, next) {
  try {
    const { userId } = res.locals;
    const { fontName } = req.body;

    const { value } = await mongoose.connection.db
      .collection('users')
      .findOneAndUpdate(
        { _id: userId },
        { $set: { defaultFont: fontName } },
        { returnDocument: 'after' }
      );
    if (!value) throw createError(400, 'Error making default font');

    const newDefaultFont = value.defaultFont;

    res.status(200).json(newDefaultFont);
  } catch (err) {
    next(err);
  }
}

module.exports = router;
