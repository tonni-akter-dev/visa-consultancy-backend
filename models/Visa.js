import mongoose from "mongoose";

const visaSchema = new mongoose.Schema(
  {
    familyName: { type: String, required: true },
    givenName: { type: String, required: true },
    visaDescription: { type: String, required: true },

    dateOfBirth: { type: String, required: true },
    documentNumber: { type: String, required: true },
    visaGrantNumber: { type: String, required: true },

    visaClass: { type: String, required: true },
    visaApplicant: { type: String, default: "Primary" },
    visaGrantDate: { type: Date, required: true },
    visaExpiryDate: { type: Date, required: true },
    location: { type: String },
    visaStatus: { type: String, default: "In Effect" },
    periodOfStay: { type: String },
    visaType: { type: String, default: "Visitor" },
    passportCountry: { type: String },
    applicationId: { type: String },
    transactionRef: { type: String },
  },
  { timestamps: true }
);

// Create a unique index to ensure one visa per person per visaGrantNumber
visaSchema.index(
  { passportNumber: 1, visaGrantNumber: 1 },
  { unique: true, background: true }
);

export default mongoose.model("Visa", visaSchema);
