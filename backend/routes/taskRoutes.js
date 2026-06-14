const express = require('express');
const router = express.Router();
const {
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.route('/:id/comments').post(addComment);

module.exports = router;
