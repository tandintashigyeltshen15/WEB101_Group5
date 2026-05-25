require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Video = require("./models/Video");

const users = [
  { username: "techwithmax", email: "max@fluxtube.com" },
  { username: "codingwithsara", email: "sara@fluxtube.com" },
  { username: "devdorji", email: "dorji@fluxtube.com" },
  { username: "tashidelek99", email: "tashi@fluxtube.com" },
  { username: "pematech", email: "pema@fluxtube.com" },
  { username: "kuenzang_dev", email: "kuenzang@fluxtube.com" },
  { username: "sonam_codes", email: "sonam@fluxtube.com" },
  { username: "jigmewangchuk", email: "jigme@fluxtube.com" },
  { username: "deki_learns", email: "deki@fluxtube.com" },
  { username: "kinley_tech", email: "kinley@fluxtube.com" },
  { username: "phuntsho_dev", email: "phuntsho@fluxtube.com" },
  { username: "namgay_codes", email: "namgay@fluxtube.com" },
  { username: "ugyen_stream", email: "ugyen@fluxtube.com" },
  { username: "choden_dev", email: "choden@fluxtube.com" },
  { username: "rinchen_tech", email: "rinchen@fluxtube.com" },
  { username: "karma_builds", email: "karma@fluxtube.com" },
  { username: "tenzin_dev", email: "tenzin@fluxtube.com" },
  { username: "yangchen_ui", email: "yangchen@fluxtube.com" },
  { username: "drukdev", email: "druk@fluxtube.com" },
  { username: "wangchuk_io", email: "wangchuk@fluxtube.com" },
];

const videos = [
  {
    title: "Python for Beginners – Full Course",
    description: "Learn Python from scratch with this comprehensive beginner course covering all fundamentals.",
    thumbnailUrl: "https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
    views: 142300, likes: 4821,
  },
  {
    title: "JavaScript Crash Course for Beginners",
    description: "Get up to speed with JavaScript in this fast-paced crash course.",
    thumbnailUrl: "https://i.ytimg.com/vi/hdI2bqOjy3c/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c",
    views: 98200, likes: 3102,
  },
  {
    title: "React JS Full Course 2024",
    description: "Build modern web apps with React. Covers hooks, state, props, and more.",
    thumbnailUrl: "https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
    views: 210500, likes: 7433,
  },
  {
    title: "Node.js Crash Course",
    description: "Learn Node.js and build backend applications with Express.",
    thumbnailUrl: "https://i.ytimg.com/vi/fBNz5xF-Kx4/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/fBNz5xF-Kx4",
    views: 87600, likes: 2911,
  },
  {
    title: "CSS Full Course – Flexbox & Grid",
    description: "Master CSS including Flexbox, Grid, animations and responsive design.",
    thumbnailUrl: "https://i.ytimg.com/vi/1Rs2ND1ryYc/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc",
    views: 63400, likes: 1872,
  },
  {
    title: "Git & GitHub Crash Course",
    description: "Everything you need to know about Git version control and GitHub.",
    thumbnailUrl: "https://i.ytimg.com/vi/RGOj5yH7evk/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/RGOj5yH7evk",
    views: 54100, likes: 1654,
  },
  {
    title: "TypeScript Full Course for Beginners",
    description: "Learn TypeScript from zero to hero with practical examples.",
    thumbnailUrl: "https://i.ytimg.com/vi/30LWjhZzg50/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/30LWjhZzg50",
    views: 71200, likes: 2340,
  },
  {
    title: "MongoDB Crash Course",
    description: "Get started with MongoDB, the popular NoSQL database.",
    thumbnailUrl: "https://i.ytimg.com/vi/-56x56UppqQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/-56x56UppqQ",
    views: 48900, likes: 1423,
  },
  {
    title: "Next.js Crash Course",
    description: "Build full-stack React apps with Next.js including SSR and API routes.",
    thumbnailUrl: "https://i.ytimg.com/vi/mTz0GXj8NN0/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/mTz0GXj8NN0",
    views: 93100, likes: 3021,
  },
  {
    title: "Tailwind CSS Crash Course",
    description: "Learn Tailwind CSS utility-first framework and build beautiful UIs fast.",
    thumbnailUrl: "https://i.ytimg.com/vi/UBOj6rqRUME/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/UBOj6rqRUME",
    views: 67800, likes: 2198,
  },
  {
    title: "Docker for Beginners – Full Course",
    description: "Learn Docker from scratch — containers, images, volumes and Docker Compose.",
    thumbnailUrl: "https://i.ytimg.com/vi/fqMOX6JJhGo/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/fqMOX6JJhGo",
    views: 112400, likes: 3876,
  },
  {
    title: "SQL Full Course for Beginners",
    description: "Complete SQL tutorial covering queries, joins, indexes and more.",
    thumbnailUrl: "https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY",
    views: 88700, likes: 2654,
  },
  {
    title: "Linux Command Line Basics",
    description: "Master the Linux terminal with this beginner-friendly command line tutorial.",
    thumbnailUrl: "https://i.ytimg.com/vi/ZtqBQ68cfJc/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ZtqBQ68cfJc",
    views: 43200, likes: 1321,
  },
  {
    title: "REST API Crash Course",
    description: "Build and consume REST APIs with Node.js and Express from scratch.",
    thumbnailUrl: "https://i.ytimg.com/vi/-MTSQjw5DrM/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/-MTSQjw5DrM",
    views: 59300, likes: 1897,
  },
  {
    title: "Machine Learning for Beginners",
    description: "Introduction to machine learning concepts, algorithms and Python implementation.",
    thumbnailUrl: "https://i.ytimg.com/vi/NWONeJKn9Kc/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/NWONeJKn9Kc",
    views: 134500, likes: 4532,
  },
  {
    title: "Java Full Course for Beginners",
    description: "Complete Java programming course covering OOP, collections, and more.",
    thumbnailUrl: "https://i.ytimg.com/vi/eIrMbAQSU34/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
    views: 176300, likes: 5841,
  },
  {
    title: "C++ Full Course for Beginners",
    description: "Learn C++ programming from the ground up with hands-on examples.",
    thumbnailUrl: "https://i.ytimg.com/vi/vLnPwxZdW4Y/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/vLnPwxZdW4Y",
    views: 92100, likes: 2987,
  },
  {
    title: "Data Structures & Algorithms Full Course",
    description: "Master DSA concepts including arrays, trees, graphs, sorting and searching.",
    thumbnailUrl: "https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/8hly31xKli0",
    views: 203400, likes: 6721,
  },
  {
    title: "AWS Full Course – Cloud Computing",
    description: "Learn Amazon Web Services from scratch and deploy real cloud applications.",
    thumbnailUrl: "https://i.ytimg.com/vi/k1RI5locZE4/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/k1RI5locZE4",
    views: 118900, likes: 3954,
  },
  {
    title: "Figma UI Design Tutorial for Beginners",
    description: "Design beautiful user interfaces with Figma — components, prototypes and more.",
    thumbnailUrl: "https://i.ytimg.com/vi/FTFaQWZBqQ8/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
    views: 76500, likes: 2543,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all existing videos and users
    await Video.deleteMany({});
    await User.deleteMany({});
    console.log("🗑  Cleared existing videos and users");

    // Create 20 users
    const hashedPassword = await bcrypt.hash("Password123", 10);
    const createdUsers = await User.insertMany(
      users.map(u => ({
        ...u,
        password: hashedPassword,
        subscribers: Math.floor(Math.random() * 50000) + 1000,
      }))
    );
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create 20 videos, one per user
    const videoData = videos.map((v, i) => ({
      ...v,
      user: createdUsers[i]._id,
    }));
    await Video.insertMany(videoData);
    console.log(`🎬 Created ${videoData.length} videos`);

    console.log("✅ Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();