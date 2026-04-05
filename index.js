const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Health check - Railway needs this
app.get('/', (req, res) => {
  res.send('Dental AI Server is running!');
});

// Vapi calls this to send SMS reminder
app.post('/send-reminder', async (req, res) => {
  try {
    const { patientPhone, patientName, appointmentTime } = req.body;

    await client.messages.create({
      body: `Hi ${patientName}, this is City Square Dental confirming your appointment on ${appointmentTime}. Call us at 604-876-4537 with any questions.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: patientPhone
    });

    console.log(`SMS sent to ${patientPhone}`);
    res.json({ success: true, message: 'SMS sent' });

  } catch (error) {
    console.error('SMS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vapi calls this when appointment is booked
app.post('/appointment-booked', async (req, res) => {
  try {
    const { patientPhone, patientName, appointmentTime, dentist } = req.body;

    await client.messages.create({
      body: `Appointment confirmed! Hi ${patientName}, you're booked with ${dentist} at City Square Dental on ${appointmentTime}. Address: 555 W 12th Ave #5, Vancouver. See you soon!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: patientPhone
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
