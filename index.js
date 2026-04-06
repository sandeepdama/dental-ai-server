const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Dental AI Server is running!');
});

app.post('/appointment-booked', async (req, res) => {
  try {
    // Ignore Vapi webhook events like speech-update, conversation-update
    const msgType = req.body?.message?.type;
    if (msgType && msgType !== 'tool-calls') {
      return res.json({ success: true, ignored: true });
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const patientPhone = req.body.patientPhone
      || req.body.phone
      || req.body.phoneNumber;

    const patientName = req.body.patientName
      || req.body.name
      || 'Patient';

    const appointmentDateTime = req.body.appointmentDateTime
      || req.body.appointmentTime
      || 'your scheduled time';

    const doctorName = req.body.doctorName
      || req.body.doctor
      || 'your doctor';

    console.log('Tool called with:', { patientPhone, patientName, appointmentDateTime, doctorName });

    if (!patientPhone) {
      console.error('No phone number received');
      return res.status(400).json({ success: false, error: 'No phone number' });
    }

    let cleanPhone = patientPhone.toString().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    await client.messages.create({
      body: `Confirmed! Hi ${patientName}, you are booked with ${doctorName} at City Square Dental on ${appointmentDateTime}. Address: 555 W 12th Ave #5, Vancouver. See you soon!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone
    });

    console.log('SMS sent to:', cleanPhone);
    res.json({ success: true });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
