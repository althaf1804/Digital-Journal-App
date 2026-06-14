const Task = require('../models/Task');
const Project = require('../models/Project');

const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  const isMember = project.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    const err = new Error('Not authorized to access this project');
    err.statusCode = 403;
    throw err;
  }
  return project;
};

// @desc    Create a task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await checkProjectAccess(projectId, req.user._id);

    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
    ]);

    const io = req.app.get('io');
    if (io) io.to(`project_${projectId}`).emit('taskCreated', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(error.statusCode || res.statusCode);
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await checkProjectAccess(projectId, req.user._id);

    const { status, assignedTo, priority } = req.query;
    const filter = { project: projectId };
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(error.statusCode || res.statusCode);
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await checkProjectAccess(task.project, req.user._id);
    res.json(task);
  } catch (error) {
    res.status(error.statusCode || res.statusCode);
    next(error);
  }
};

// @desc    Update task (title, description, assignee, status, priority, due date)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await checkProjectAccess(task.project, req.user._id);

    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    const updated = await task.save();
    const populated = await updated.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'comments.user', select: 'name email avatar' },
    ]);

    const io = req.app.get('io');
    if (io) io.to(`project_${task.project}`).emit('taskUpdated', populated);

    res.json(populated);
  } catch (error) {
    res.status(error.statusCode || res.statusCode);
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await checkProjectAccess(task.project, req.user._id);

    const projectId = task.project;
    await task.deleteOne();

    const io = req.app.get('io');
    if (io) io.to(`project_${projectId}`).emit('taskDeleted', { _id: req.params.id });

    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    res.status(error.statusCode || res.statusCode);
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await checkProjectAccess(task.project, req.user._id);

    task.comments.push({ user: req.user._id, text });
    await task.save();

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'comments.user', select: 'name email avatar' },
    ]);

    const io = req.app.get('io');
    if (io) io.to(`project_${task.project}`).emit('taskUpdated', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(error.statusCode || res.statusCode);
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
};
