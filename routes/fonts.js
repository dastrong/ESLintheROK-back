const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const Font = require('../models/font');

// would use a verifyToken middleware to get this userId usually
router.get('/fonts/:userId', getUserFonts);
router.post('/fonts/:userId', handleFont);

async function getUserFonts(req, res, next) {
  try {
    const { userId } = req.params;

    const fonts = await Font.find({ userIds: userId })
      .select('-_id name fontFamily')
      .lean();
    if (!fonts) throw createError(400, 'Error finding user fonts');

    res.status(200).json(fonts);
  } catch (err) {
    next(err);
  }
}

async function handleFont(req, res, next) {
  try {
    const { userId } = req.params;
    const { name, fontFamily, addIt } = req.body;
    if (!name) {
      throw createError(400, 'Error adding font (missing name)');
    }
    if (!fontFamily) {
      throw createError(400, 'Error adding font (missing fontFamily)');
    }

    const font = await Font.findOne({ name, fontFamily });
    let updatedFont;
    if (font) {
      // filter out the userId from the userIds array
      const filteredUserIds = font.userIds.filter(id => id !== userId);
      // if passed an addIt variable we'll add it back - note: userId can't be added twice
      if (addIt) filteredUserIds.push(userId);

      if (filteredUserIds.length) {
        // if we still have a userId in there, we'll save it
        font.userIds = filteredUserIds;
        updatedFont = await font.save();
      } else {
        // if there's no users with that font, we'll remove it
        updatedFont = await font.remove();
      }

      // returns the updated font to the user
      return res.status(200).json(updatedFont);
    } else {
      const newFont = await Font.create({
        name,
        fontFamily,
        userIds: [userId],
      });
      return res.status(201).json(newFont);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = router;
