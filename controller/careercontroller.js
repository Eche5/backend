const CareerJob = require("../models/careerjob");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const applyForJobTemplate = require("../utils/emails/sendJobApplicationEmail");
const sendAutoReplyEmailsTemplate = require("../utils/emails/autoReplyEmail");
const sendMailwithAttachment = require("../utils/sendMailwithAttachment");
const sendEmail = require("../utils/sendMail");
const sendCareerEmail = require("../utils/sendCareerEmail");

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
      salary,
      working_days,
      working_hours,
      summary,
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
      salary,
      working_days,
      working_hours,
      summary,
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
      salary,
      working_days,
      working_hours,
      summary,
    } = req.body;
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
      salary,
      working_days,
      working_hours,
      summary,
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
    const whereClause = {
      status: {
        [Op.notIn]: [
          "draft",
          "archived",
          "on hold",
          "archived",
          "under review",
        ], // exclude these statuses
      },
    };

    if (department) {
      // only if department has a value
      whereClause.department = department;
    }

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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }
    const attachments = req.files;

    // 1. Query the job details by selectedJob ID
    // Replace this with your actual DB query method
    const job = await CareerJob.findOne({ where: { id: selectedjob } });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Selected job not found",
      });
    }

    // 2. Email to HR (with job title included)
    // ... after fetching the job record

    const { subject, html } = applyForJobTemplate(
      firstName,
      lastName,
      email,
      phone,
      location,
      experience,
      coverLetter,
      linkedIn,
      job
    );
    const { subject: autoSubject, html: autoHtml } =
      sendAutoReplyEmailsTemplate(job, firstName);
    sendMailwithAttachment({
      to: "career@pickupmanng.ng",
      subject,
      html,
      attachments,
    });

    sendCareerEmail({
      to: email,
      subject: autoSubject,
      html: autoHtml,
    });

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
