const mongoose = require("mongoose");

const practiceSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    topic: { type: String, default: "", trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    link: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    // YYYY-MM-DD so we can group by day
    day: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Practice", practiceSchema);
