const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    // "today"    -> things to do today
    // "tomorrow" -> things to do tomorrow
    bucket: { type: String, enum: ["today", "tomorrow"], default: "today" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
