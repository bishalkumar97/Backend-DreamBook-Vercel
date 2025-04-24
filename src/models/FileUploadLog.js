const mongoose = require('mongoose');

const fileUploadLogSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['products', 'orders'],
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    recordsProcessed: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const FileUploadLog = mongoose.model('FileUploadLog', fileUploadLogSchema);

module.exports = FileUploadLog;