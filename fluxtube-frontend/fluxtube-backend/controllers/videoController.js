const Video = require("../models/Video");
const path = require("path");
const fs = require("fs");

// Convert any YouTube URL to embed format
const toEmbedUrl = (url) => {
  if (!url) return url;
  if (url.includes("youtube.com/embed/")) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.log("GET VIDEOS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("user", "username avatar");
    if (!video) return res.status(404).json({ message: "Video not found" });
    video.views = (video.views || 0) + 1;
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ message: "Title and video URL are required" });
    }
    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl: toEmbedUrl(videoUrl),
      user: req.user.id,
    });
    const populated = await video.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    console.log("CREATE VIDEO ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createVideoWithFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const { title, description, thumbnailUrl, tags } = req.body;

    if (!title) {
      // Clean up uploaded file if title missing
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Title is required" });
    }

    // Build the URL to access the file
    const videoUrl = `/uploads/${req.file.filename}`;

    // Use first frame thumbnail if none provided
    const finalThumbnail = thumbnailUrl && thumbnailUrl.trim()
      ? thumbnailUrl.trim()
      : "https://via.placeholder.com/640x360/1a1a1a/e53e3e?text=FluxTube+Video";

    const video = await Video.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      thumbnailUrl: finalThumbnail,
      videoUrl,
      user: req.user.id,
    });

    const populated = await video.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    // Clean up file if DB save fails
    if (req.file) fs.unlink(req.file.path, () => {});
    console.log("CREATE VIDEO WITH FILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this video" });
    }

    // Delete the actual file from disk if it's a local upload
    if (video.videoUrl && video.videoUrl.startsWith("/uploads/")) {
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