import express from "express";
import EVisa from "../models/evisa.js";

const router = express.Router();

/**
 * CREATE EVISA
 */
router.post("/", async (req, res) => {
  try {
    const visa = await EVisa.create(req.body);

    res.status(201).json({
      success: true,
      data: visa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET ALL EVISAS
 */
router.get("/", async (req, res) => {
  try {
    const visas = await EVisa.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: visas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET EVISA BY VISA NUMBER (IMPORTANT)
 */
router.get("/check/:visaNumber", async (req, res) => {
  try {
    const visa = await EVisa.findOne({
      visaNumber: req.params.visaNumber,
    });

    if (!visa) {
      return res.status(404).json({
        success: false,
        message: "Visa not found",
      });
    }

    res.json({
      success: true,
      data: visa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * UPDATE EVISA
 */
router.put("/:id", async (req, res) => {
  try {
    const visa = await EVisa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      data: visa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/**
 * GET EVISA BY ID
 */
router.get("/:id", async (req, res) => {
  try {
    const visa = await EVisa.findById(req.params.id);

    if (!visa) {
      return res.status(404).json({
        success: false,
        message: "EVisa not found",
      });
    }

    res.json({
      success: true,
      data: visa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/**
 * DELETE EVISA
 */
router.delete("/:id", async (req, res) => {
  try {
    await EVisa.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "EVisa deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
