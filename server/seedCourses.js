// server/seedCourses.js
require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./models/Course");

const courses = [
  {
    title: "IC3 Digital Literacy Certification",
    description:
      "Master essential digital skills with this comprehensive eCourse and earn your certification.",
    image: "/images/ic3.jpg",
    category: "Digital Literacy",
    xp: 250,
    instructor: "Admin",
  },
  {
    title: "Communication Skills for Business",
    description:
      "Develop professional communication skills essential for business success.",
    image: "/images/communication.jpg",
    category: "Business",
    xp: 200,
    instructor: "Admin",
  },
  {
    title: "Cisco CCST Networking",
    description:
      "Kickstart your career with Cisco Certified Support Technician certification.",
    image: "/images/networking.jpg",
    category: "Networking",
    xp: 350,
    instructor: "Admin",
  },
  {
    title: "App Development with Swift",
    description:
      "Build real iOS applications using Apple's powerful Swift programming language.",
    image: "/images/app.jpg",
    category: "Programming",
    xp: 400,
    instructor: "Admin",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear old courses
    await Course.deleteMany({});
    console.log("🧹 Old courses removed");

    // Insert new courses
    await Course.insertMany(courses);
    console.log("🎉 Courses seeded successfully!");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    mongoose.connection.close();
  }
}

seed();
