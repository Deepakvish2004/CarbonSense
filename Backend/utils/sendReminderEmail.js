import dotenv from "dotenv";
import { mailer } from "./mailer.js";

dotenv.config(); // ✅ IMPORTANT

export async function sendReminderEmail(email) {
  try {
    console.log("📧 sendReminderEmail() called for:", email);
    console.log("📧 Using mail user:", process.env.MAIL_USER);

    const message = {
      from: `Carbon Analyzer <${process.env.MAIL_USER}>`,
      to: email,
      subject: "🔔 Please Confirm Your Activity Status",
      html: `
        <div style="font-family:Arial; padding:20px;">
          <h2>Activity Confirmation Required</h2>
          <p>You have not responded to multiple activity reminders.</p>
          <p>Please log in and confirm whether you are:</p>
          <ul>
            <li><b>Active</b></li>
            <li><b>Inactive</b></li>
          </ul>
          <p style="color:gray">
            This helps us keep your account status accurate.
          </p>
        </div>
      `,
    };

    await mailer.sendMail(message);

    console.log("✅ Reminder email ACTUALLY sent to:", email);
  } catch (err) {
    console.error("❌ Reminder email failed:", err);
    throw err; // 🔥 allow admin route to know it failed
  }
}
