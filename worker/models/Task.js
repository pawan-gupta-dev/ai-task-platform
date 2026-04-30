const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    inputText: {
      type: String,
      required: true,
    },
    operation: {
      type: String,
      enum: ['uppercase', 'lowercase', 'reverse', 'wordcount'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
    result: {
      type: String,
      default: null,
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
