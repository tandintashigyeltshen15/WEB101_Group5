const express = require("express");
const router = express.Router();
const {
  getVideos,
  getVideoById,
  incrementView,
  createVideo,
  createVideoWithFile,
  likeVideo,
  deleteVideo,
} = require("../controllers/videoController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/", getVideos);
router.get("/:id", getVideoById);
router.put("/:id/view", incrementView);          // ← separate view increment
router.post("/", protect, createVideo);
router.post("/upload-file", protect, (req, res, next) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      console.log("MULTER ERROR:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createVideoWithFile);
router.put("/:id/like", protect, likeVideo);
router.delete("/:id", protect, deleteVideo);

module.exports = router;