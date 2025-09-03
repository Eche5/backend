const applyForJobTemplate = (
  firstName,
  lastName,
  email,
  phone,
  location,
  experience,
  coverLetter,
  linkedIn,
  job
) => {
  const subject = `Job Application for ${job.title} from ${firstName} ${lastName}`;

  const html = `
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
  `;
  return { subject, html };
};

module.exports = applyForJobTemplate;
