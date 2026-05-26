const express = require("express");
const router = express.Router();
const axios = require("axios");

/**
 * POST /api/ai/summary
 * Uses Hugging Face free inference API to generate summaries
 */
router.post("/summary", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: prompt.slice(0, 1000) }, // BART works best under 1000 chars
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = response.data?.[0]?.summary_text || "Could not generate summary.";
    res.json({ summary });
  } catch (err) {
    console.log("HF ERROR:", err.response?.data || err.message);
    res.status(500).json({
      message: "Failed to generate summary",
      error: err.message,
    });
  }
});

module.exports = router;