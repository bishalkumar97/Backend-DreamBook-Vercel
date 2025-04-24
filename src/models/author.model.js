const mongoose = require("mongoose");

// Check if model already exists to prevent recompilation
if (mongoose.models.Author) {
  module.exports = mongoose.models.Author;
} else {
  const authorSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      bio: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      }
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Author", authorSchema);
}