const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
});

module.exports = mongoose.model('Task', TaskSchema);
