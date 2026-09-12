module.exports = {
  openapi: '3.0.0',
  info: { title: 'Task Manager API', version: '1.0.0', description: 'CRUD API for task management' },
  servers: [{ url: '/' }],
  paths: {
    '/api/tasks': {
      get: {
        summary: 'Get all tasks (filter by title or status)',
        parameters: [
          { name: 'title', in: 'query', schema: { type: 'string' }, description: 'Fuzzy title search' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in-progress', 'done'] } },
        ],
        responses: { 200: { description: 'List of tasks' } },
      },
      post: {
        summary: 'Create a task',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } },
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' } },
      },
    },
    '/api/tasks/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { summary: 'Get task by ID', responses: { 200: { description: 'The task' }, 404: { description: 'Not found' } } },
      put: {
        summary: 'Update a task',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } },
        },
        responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' } },
      },
      delete: { summary: 'Delete a task', responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
  },
  components: {
    schemas: {
      TaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          dueDate: { type: 'string', format: 'date' },
        },
      },
    },
  },
};