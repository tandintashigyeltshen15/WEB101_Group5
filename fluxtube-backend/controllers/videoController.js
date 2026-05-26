const Video = require("../models/Video");
const path = require("path");
const fs = require("fs");

/**
 * @desc    Convert any YouTube URL format to embed format
 * @param   {string} url - Raw YouTube URL (watch, short, or embed)
 * @returns {string} Embed-formatted URL or original if not YouTube
 */
const toEmbedUrl = (url) => {
  if (!url) return url;
  // Already in embed format — return as-is
  if (url.includes("youtube.com/embed/")) return url;
  // Handle youtu.be short URLs → embed
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // Handle youtube.com/watch?v= URLs → embed
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url; // Not a YouTube URL — return unchanged
};

/**
 * @desc    Get all videos sorted by newest first
 * @route   GET /api/videos
 * @access  Public
 */
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("user", "username avatar") // Join user data (username + avatar only)
      .sort({ createdAt: -1 });            // Newest videos first
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get a single video by its MongoDB ID
 * @route   GET /api/videos/:id
 * @access  Public
 */
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("user", "username avatar");
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Increment view count for a video by 1
 * @route   PUT /api/videos/:id/view
 * @access  Public
 * Note: Separated from getVideoById so views only increment on intentional watch
 */
exports.incrementView = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Atomic increment — safe for concurrent requests
      { new: true }           // Return the updated document
    );
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json({ views: video.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a video entry from a YouTube link
 * @route   POST /api/videos
 * @access  Protected (JWT required)
 * Note: Converts any YouTube URL format to embed format before saving
 */
exports.createVideo = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl } = req.body;

    // Validate required fields
    if (!title || !videoUrl) {
      return res.status(400).json({ message: "Title and video URL are required" });
    }

    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl: toEmbedUrl(videoUrl), // Normalize to embed format
      user: req.user.id,              // Attach logged-in user's ID
    });

    // Populate user info before returning so frontend gets username immediately
    const populated = await video.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upload a video file (MP4/MOV/AVI/MKV) via Multer middleware
 * @route   POST /api/videos/upload-file
 * @access  Protected (JWT required)
 * Note: File is saved to /uploads folder. If DB save fails, file is deleted
 *       to prevent orphaned files accumulating on disk.
 */
exports.createVideoWithFile = async (req, res) => {
  try {
    // Multer stores the file — if missing, reject early
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const { title, description, thumbnailUrl } = req.body;

    // Title is required — clean up uploaded file if missing
    if (!title) {
      fs.unlink(req.file.path, () => {}); // Delete orphaned file
      return res.status(400).json({ message: "Title is required" });
    }

    // Build the public URL to access the stored video file
    const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    // Use provided thumbnail URL or null (frontend shows placeholder)
    const finalThumbnail = thumbnailUrl && thumbnailUrl.trim()
      ? thumbnailUrl.trim()
      : null;

    const video = await Video.create({
      title:       title.trim(),
      description: description ? description.trim() : "",
      thumbnailUrl: finalThumbnail,
      videoUrl,
      user: req.user.id,
    });

    const populated = await video.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    // Clean up the uploaded file if anything went wrong during DB save
    if (req.file) fs.unlink(req.file.path, () => {});
    console.log("CREATE VIDEO WITH FILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Increment like count on a video by 1
 * @route   PUT /api/videos/:id/like
 * @access  Protected (JWT required)
 * Note: Uses $inc for atomic update — safe under concurrent requests
 */
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // Atomic increment
      { new: true }
    );
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a video and its associated file from disk
 * @route   DELETE /api/videos/:id
 * @access  Protected (JWT required — owner only)
 * Note: Checks that the requesting user owns the video before deleting.
 *       Also removes the physical file from /uploads to free disk space.
 */
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Authorization check — only the video owner can delete
    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete the physical file from disk if it was a local upload
    if (video.videoUrl && video.videoUrl.includes("/uploads/")) {
      const filePath = path.join(__dirname, "../uploads", path.basename(video.videoUrl));
      fs.unlink(filePath, (err) => {
        if (err) console.log("File delete error:", err.message);
      });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};