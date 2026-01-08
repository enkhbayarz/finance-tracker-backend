const express = require('express');
const app = express();
const port = 3000;

// Fake data for the activity feed
const activityFeed = [
  {
    id: 1000,
    title: 'New Photo Uploaded',
    body: 'Alice uploaded a new photo to her album.'
  },
  {
    id: 2000,
    title: 'Comment on Post',
    body: "Bob commented on Charlie's post."
  },
  {
    id: 13,
    title: 'Status Update',
    body: 'Charlie updated their status: "Excited about the new project!"'
  }
];

app.get('/feed', (req, res) => {
  res.json(activityFeed);

// Fake data for tasks
const tasks = [
  {
    id: 1,
    description: 'Complete monthly financial report'
  },
  {
    id: 2,
    description: 'Plan team building activity'
  },
  {
    id: 3,
    description: 'Update project documentation'
  }
];

app.get('/search', (req, res) => {
  // Retrieve the query parameter
  const query = req.query.query?.toLowerCase() || '';

  // Filter tasks based on the query
  const filteredTasks = tasks.filter(task => task.description.toLowerCase().includes(query));

  res.json(filteredTasks);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});