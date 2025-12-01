import { mailer } from "../utils/mailer.js";

export async function sendHighEmissionAlert(email, emissionValue) {
  const message = {
    from: "Carbon Analyzer <yourgmail@gmail.com>",
    to: email,
    subject: "⚠ High Carbon Emission Detected!",
    html: `
      <h2>Your Carbon Emission is High Today</h2>
      <p><b>Today's CO2:</b> ${emissionValue} kg</p>
      <p>This is higher than the safe limit.</p>
      <h3>Tips to Reduce Emission:</h3>
      <ul>
        <li>Reduce screen brightness</li>
        <li>Close background apps</li>
        <li>Put laptop in battery saver mode</li>
      </ul>
    `,
  };

  await mailer.sendMail(message);
}
