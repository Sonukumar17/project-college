const mongoose = require("mongoose");

const academyRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    mobile: {
      type: String,
      required: true,
      match: /^\d{10}$/,
    },
  },
  { timestamps: true }
);

academyRegistrationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("AcademyRegistration", academyRegistrationSchema);
