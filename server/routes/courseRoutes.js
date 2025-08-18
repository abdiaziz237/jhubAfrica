const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Public course listing
router.get('/', async (req, res) => {
  const courses = await Course.find({}).select('-content');
  res.json(courses);
});

// Protected course content
router.get('/:id/content', async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json(course);
});

module.exports = router;