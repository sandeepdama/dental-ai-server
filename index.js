const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Dental AI Server is running!');
});

app.post('/send-reminder', async (req, res) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const { patientPhone, patientName, appointmentTime } = req.body;
    await client.messages.create({
      body: `Hi ${patientName}, this is City Square Dental confirming your appointment on ${appointmentTime}. Call us at 604-876-4537 with any questions.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: patientPhone
    });
    res.json({ success: true, message: 'SMS sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/appointment-booked', async (req, res) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const { patientPhone, patientName, appointmentTime, dentist } = req.body;
    await client.messages.create({
      body: `Confirmed! Hi ${patientName}, you are booked with ${dentist} at City Square Dental on ${appointmentTime}. Address: 555 W 12th Ave #5, Vancouver. See you soon!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: patientPhone
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
