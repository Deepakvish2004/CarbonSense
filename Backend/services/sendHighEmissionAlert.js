import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// 🚀 Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 🚀 Send High Emission Alert Email
export default async function sendHighEmissionAlert(email, emissionValue, level) {
  try {
    console.log("📧 Sending email to:", email);

    await transporter.sendMail({
      from: `"Carbon Analyzer System" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `⚠ High Carbon Emission Alert — ${level} Level Detected`,
      html: `
        <div style="
          font-family: Arial, sans-serif; 
          padding: 20px; 
          border-radius: 12px; 
          background: #f0fdf4; 
          border: 1px solid #86efac;
          max-width: 600px;
          margin: auto;
        ">
          
          <h2 style="color: #166534; text-align:center;">
            ⚠ High Carbon Emission Alert
          </h2>

          <p style="font-size: 16px; color: #334155;">
            Hello User,
          </p>

          <p style="font-size: 15px; color: #334155;">
            Our system has detected a <b style="color:#b91c1c;">high level of carbon emission</b> 
            based on your recent computer usage.
          </p>

          <div style="
            background:#dcfce7;
            padding:12px; 
            border-radius:8px; 
            margin:15px 0;
            border-left:4px solid #16a34a;
          ">
            <p style="font-size: 16px;">
              📊 <b>Total Emission:</b> <span style="color:#0f172a;">${emissionValue} kg CO₂</span><br/>
              🚨 <b>Alert Level:</b> <span style="color:#b91c1c;">${level}</span>
            </p>
          </div>

          <hr style="margin: 20px 0; border-color:#a7f3d0;">

          <h3 style="color: #14532d;">🌿 Recommended Actions to Reduce Emissions:</h3>

          <ul style="font-size: 15px; color: #334155; padding-left: 20px;">
            <li>Reduce screen brightness and close unused applications.</li>
            <li>Use power-saving or battery-optimization mode.</li>
            <li>Avoid keeping your charger plugged in continuously.</li>
            <li>Shut down or sleep your device during long idle periods.</li>
            <li>Limit high-performance tasks that heavily use CPU/GPU.</li>
          </ul>

          <hr style="margin: 20px 0; border-color:#a7f3d0;">

          <p style="font-size: 14px; color:#475569;">
            Staying mindful of your computer usage helps reduce environmental impact 
            and improves your energy efficiency.
          </p>

          <p style="font-size: 14px; color: #166534; margin-top: 20px; text-align:center;">
            🌍 Thank you for using the Carbon Analyzer System!
          </p>
        </div>
      `,
    });

    console.log("📧 Email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}
