// models/visa.model.js
import mongoose from "mongoose";

const EvisaSchema = new mongoose.Schema(
  {
    surname: { type: String, required: true },
    firstName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    citizenship: { type: String, required: true },
    passportNumber: { type: String, required: true },

    visaNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Issued Visa", "Rejected", "Pending"],
      default: "Pending",
    },
    validity: { type: String },
    visaType: { type: String },
    visitPurpose: { type: String },

    photo: { type: String }, // image URL
  },
  { timestamps: true },
);

export default mongoose.model("EVisa", EvisaSchema);
