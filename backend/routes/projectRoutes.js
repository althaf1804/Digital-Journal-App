const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addMember,
  deleteProject,
} = require('../controllers/projectController');
const {
  createTask,
  getTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createProject).get(getProjects);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);
router.route('/:id/members').post(addMember);

// Nested task routes
router.route('/:projectId/tasks').post(createTask).get(getTasks);

module.exports = router;
