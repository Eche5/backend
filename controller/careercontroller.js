const CareerJob = require("../models/careerjob");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

// Multer setup for file uploads
const storage = multer.memoryStorage(); // store in memory for direct email sending
const upload = multer({ storage });
// Create a new job
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      city,
      state,
      type,
      description,
      requirements,
      posted,
      status,
    } = req.body;

    // Ensure requirements is stored as array
    const job = await CareerJob.create({
      title,
      department,
      city,
      state,
      type,
      description,
      requirements, // should be an array from frontend
      posted,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating job",
      error: error.message,
    });
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      department,
      state,
      city,
      type,
      description,
      requirements,
      posted,
      status,
    } = req.body;
    console.log(id);
    const job = await CareerJob.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await job.update({
      title,
      department,
      state,
      city,
      type,
      description,
      requirements,
      posted,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating job",
      error: error.message,
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await CareerJob.destroy({ where: { id: id } });

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating job",
      error: error.message,
    });
  }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await CareerJob.findAll({
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching jobs",
      error: error.message,
    });
  }
};

exports.getUserJobsOpenings = async (req, res) => {
  try {
    const { department } = req.params;
    console.log("query", department);
    const whereClause = {
      status: {
        [Op.notIn]: ["draft", "archived"], // exclude these statuses
      },
    };

    if (department) {
      // only if department has a value
      whereClause.department = department;
    }

    console.log(whereClause);
    const jobs = await CareerJob.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching jobs",
      error: error.message,
    });
  }
};

exports.uploadResume = upload.single("resume");

exports.applyForJob = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      experience,
      coverLetter,
      linkedIn,
      selectedjob,
    } = req.body;
    console.log(selectedjob);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    // 1. Query the job details by selectedJob ID
    // Replace this with your actual DB query method
    const job = await CareerJob.findOne({ where: { id: selectedjob } });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Selected job not found",
      });
    }

    // Setup nodemailer transporter for ZeptoMail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.zeptomail.com",
      port: 587,
      auth: {
        user: "emailapikey",
        pass: process.env.PASSWORD,
      },
    });

    // 2. Email to HR (with job title included)
    // ... after fetching the job record

    const hrMailOptions = {
      from: process.env.EMAIL,
      to: "career@pickupmanng.ng",
      subject: `Job Application for ${job.title} from ${firstName} ${lastName}`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
      <h2 style="color: #0056b3; margin-bottom: 10px;">📄 New Job Application for ${job.title}</h2>
      <p style="margin-bottom: 20px;">
        You have received a new job application for the position <strong>${job.title}</strong>. Below are the applicant's details:
      </p>
      <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold; width: 150px;">Name</td>
          <td>${firstName} ${lastName}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">Email</td>
          <td>${email}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">Phone</td>
          <td>${phone}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">Location</td>
          <td>${location}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">Experience</td>
          <td>${experience}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">LinkedIn</td>
          <td><a href="${linkedIn}" target="_blank">${linkedIn}</a></td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">Applied Position</td>
          <td>${job.title}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">City</td>
          <td>${job.city}</td>
        </tr>
        <tr>
          <td style="background-color: #f7f7f7; font-weight: bold;">State</td>
          <td>${job.state}</td>
        </tr>
      </table>
      <h3 style="margin-top: 30px; color: #0056b3;">Cover Letter</h3>
      <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
        ${coverLetter}
      </p>
      <p style="margin-top: 20px;">📎 Resume is attached to this email.</p>
    </div>
  `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ],
    };

    const autoReplyOptions = {
      from: "career@pickupmanng.ng", // verified sender
      to: email,
      subject: `We Received Your Application for ${job.title}`,
      text: `Hello ${firstName},

Thank you for applying for the position of "${job.title}" based in ${job.city}, ${job.state} at pickupmanng. We have received your application and our HR team will review it shortly.

Best regards,
HR Team`,
    };

    await transporter.sendMail(hrMailOptions);

    // 3. Auto-response to applicant (include job title)

    await transporter.sendMail(autoReplyOptions);

    res.status(200).json({
      success: true,
      message: "Application submitted successfully and auto-response sent",
    });
  } catch (error) {
    console.error("Error sending job application:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending application",
    });
  }
};
