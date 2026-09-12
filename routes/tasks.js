const router = require('express').Router();
const Task = require('../models/Task');

// Create
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Task.create(req.body));
  } catch (e) { next(e); }
});

// Read all (with ?title= and ?status= filters)
router.get('/', async (req, res, next) => {
  try {
    const { title, status } = req.query;
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (status) filter.status = status;
    res.json(await Task.find(filter));
  } catch (e) { next(e); }
});

// Read by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (e) {
    if (e.name === 'CastError') return res.status(404).json({ error: 'Task not found' });
    next(e);
  }
});

// Update
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (e) {
    if (e.name === 'CastError') return res.status(404).json({ error: 'Task not found' });
    next(e);
  }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (e) {
    if (e.name === 'CastError') return res.status(404).json({ error: 'Task not found' });
    next(e);
  }
});

module.exports = router;