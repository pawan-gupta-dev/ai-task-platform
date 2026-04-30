const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for fast queries
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    inputText: {
      type: String,
      required: [true, 'Please provide input text'],
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
      index: true, // Index for fast queries
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
  { timestamps: true, indexes: [['userId', 'createdAt']] }
);

module.exports = mongoose.model('Task', taskSchema);
