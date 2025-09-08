import express from "express";
// import auth from "../middleware/auth.js";
import Visa from "../models/Visa.js";
import { escapeRegex, parseFlexibleDate, sameYMD } from "../utils/dateUtils.js";

const router = express.Router();

// Helper n to parse dates from DD-MM-YYYY or YYYY-MM-DD

// Helper function to format Date objects to "DD MMM YYYY"
function formatDateToDisplay(date) {
  if (!date) return null;
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options);
}

// Middleware to format all date fields before sending response
function formatVisaDates(visa) {
  if (!visa) return null;
  return {
    ...visa._doc,
    dateOfBirth: formatDateToDisplay(visa.dateOfBirth),
    visaGrantDate: formatDateToDisplay(visa.visaGrantDate),
    visaExpiryDate: formatDateToDisplay(visa.visaExpiryDate),
    mustNotArriveAfter: formatDateToDisplay(visa.mustNotArriveAfter),
    enterBeforeDate: formatDateToDisplay(visa.enterBeforeDate),
  };
}

// GET all visas for logged-in user
router.get("/", async (req, res) => {
  try {
    const visas = await Visa.find({ user: req.user }).sort({ createdAt: -1 });
    const formattedVisas = visas.map(formatVisaDates);
    res.json(formattedVisas);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET single visa by ID
router.get("/:id", async (req, res) => {
  try {
    const visa = await Visa.findOne({ _id: req.params.id, user: req.user });
    if (!visa) return res.status(404).json({ msg: "Visa not found" });
    res.json(formatVisaDates(visa));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
// CREATE new visa
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };

    // Convert all date fields to Date objects using parseFlexibleDate
    [
      "dateOfBirth",
      "visaGrantDate",
      "visaExpiryDate",
      "mustNotArriveAfter",
      "enterBeforeDate",
    ].forEach((field) => {
      if (data[field]) {
        const parsed = parseFlexibleDate(data[field]);
        if (!parsed) {
          throw new Error(`Invalid date format for field: ${field}`);
        }
        data[field] = parsed;
      }
    });

    if (!data.familyName || !data.givenNames || !data.visaGrantDate) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    const visa = new Visa({ ...data, user: req.user });
    await visa.save();

    res.json(formatVisaDates(visa));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// UPDATE visa
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };

    [
      "dateOfBirth",
      "visaGrantDate",
      "visaExpiryDate",
      "mustNotArriveAfter",
      "enterBeforeDate",
    ].forEach((field) => {
      if (data[field]) {
        const parsed = parseFlexibleDate(data[field]);
        if (!parsed) {
          throw new Error(`Invalid date format for field: ${field}`);
        }
        data[field] = parsed;
      }
    });

    const updatedVisa = await Visa.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedVisa) {
      return res.status(404).json({ msg: "Visa not found" });
    }

    res.json(formatVisaDates(updatedVisa));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE visa
router.delete("/:id", async (req, res) => {
  try {
    const visa = await Visa.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });
    if (!visa) return res.status(404).json({ msg: "Visa not found" });
    res.json({ msg: "Visa deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
// "20 Oct 2525" -> Date object
// router.post("/search", async (req, res) => {
//   try {
//     const { visaGrantNumber, dateOfBirth, passportNumber } = req.body || {};

//     if (!visaGrantNumber || !dateOfBirth || !passportNumber) {
//       return res.status(400).json({ msg: "All three fields are required: visaGrantNumber, dateOfBirth, passportNumber" });
//     }

//     // parse client-sent DOB into Date (supports m/d/yyyy etc.)
//     const inputDob = parseFlexibleDate(dateOfBirth);
//     if (!inputDob) {
//       return res.status(400).json({ msg: "Invalid dateOfBirth format. Accepts m/d/yyyy, dd MMM yyyy, yyyy-mm-dd, etc." });
//     }

//     // Find candidate by visaGrantNumber and passport/document number
//     // Use case-insensitive match for visaGrantNumber (trim both)
//     const visa = await Visa.findOne({
//       visaGrantNumber: { $regex: `^${escapeRegex(visaGrantNumber.trim())}$`, $options: "i" },
//       $or: [
//         { documentNumber: passportNumber.trim() },   // if your DB uses documentNumber
//         { passportNumber: passportNumber.trim() }    // or passportNumber field
//       ]
//     }).lean(); // lean() to get plain object

//     if (!visa) return res.status(404).json({ msg: "No matching visa found (visaGrantNumber + passportNumber mismatch)" });

//     // Normalize stored DOB (may be string or Date)
//     let storedDobValue = visa.dateOfBirth;
//     let storedDob = null;

//     if (storedDobValue instanceof Date) {
//       storedDob = new Date(storedDobValue.getFullYear(), storedDobValue.getMonth(), storedDobValue.getDate());
//     } else if (typeof storedDobValue === "string") {
//       storedDob = parseFlexibleDate(storedDobValue);
//     } else if (storedDobValue == null) {
//       storedDob = null;
//     } else {
//       // try to coerce
//       const tryDate = new Date(storedDobValue);
//       if (!isNaN(tryDate.getTime())) storedDob = new Date(tryDate.getFullYear(), tryDate.getMonth(), tryDate.getDate());
//     }

//     if (!storedDob) {
//       return res.status(500).json({ msg: "Stored dateOfBirth in DB is unparseable for this record." });
//     }

//     // Compare day/month/year
//     if (!sameYMD(inputDob, storedDob)) {
//       return res.status(404).json({ msg: "No matching visa found (dateOfBirth mismatch)" });
//     }

//     // All three matched -> return full visa object
//     return res.json(visa);

//   } catch (err) {
//     console.error("Visa search error:", err);
//     return res.status(500).json({ msg: err.message || "Server error" });
//   }
// });
// POST /api/visas/search
router.post("/search", async (req, res) => {
  try {
    const { visaGrantNumber, dateOfBirth, passportNumber } = req.body || {};

    // Validate input
    if (!visaGrantNumber || !dateOfBirth || !passportNumber) {
      return res.status(400).json({
        msg: "All three fields are required: visaGrantNumber, dateOfBirth, passportNumber",
      });
    }

    // Parse client-sent DOB into Date object
    const inputDob = parseFlexibleDate(dateOfBirth);
    if (!inputDob) {
      return res.status(400).json({
        msg: "Invalid dateOfBirth format. Accepts m/d/yyyy, dd MMM yyyy, yyyy-mm-dd, etc.",
      });
    }

    // Create UTC range for the entire day to avoid timezone issues
    const startOfDayUTC = new Date(Date.UTC(inputDob.getFullYear(), inputDob.getMonth(), inputDob.getDate(), 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(inputDob.getFullYear(), inputDob.getMonth(), inputDob.getDate(), 23, 59, 59, 999));

    // Find visa in DB
    const visa = await Visa.findOne({
      visaGrantNumber: { $regex: `^${escapeRegex(visaGrantNumber.trim())}$`, $options: "i" },
      $or: [
        { documentNumber: passportNumber.trim() },
        { passportNumber: passportNumber.trim() }
      ],
      dateOfBirth: { $gte: startOfDayUTC, $lte: endOfDayUTC }, // timezone-safe
    }).lean();

    if (!visa) {
      return res.status(404).json({
        msg: "No matching visa found (visaGrantNumber, passportNumber, or dateOfBirth mismatch)",
      });
    }

    // Return full visa object
    return res.json(visa);

  } catch (err) {
    console.error("Visa search error:", err);
    return res.status(500).json({ msg: err.message || "Server error" });
  }
});


export default router;
