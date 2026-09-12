require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const tasks = require('./routes/tasks');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./docs/swagger');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/api/tasks', tasks);

// 404 + central error handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

mongoose.connect(process.env.MONGO_URI + 'tasksdb')
  .then(() => app.listen(process.env.PORT || 3000, () => console.log('API on port ' + (process.env.PORT || 3000))))
  .catch(e => { console.error('DB connect failed:', e.message); process.exit(1); });