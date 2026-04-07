const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Dental AI Server is running!');
});

app.post('/appointment-booked', async (req, res) => {
  try {
    console.log('FULL BODY:', JSON.stringify(req.body));

    const patientPhone = req.body.patientPhone || req.body.phone || req.body.phoneNumber;
    const patientName = req.body.patientName || req.body.name || 'Patient';
    const appointmentDateTime = req.body.appointmentDateTime || req.body.appointmentTime || 'your scheduled time';
    const doctorName = req.body.doctorName || req.body.doctor || 'your doctor';

    if (!patientPhone) {
      console.error('NO PHONE NUMBER IN REQUEST');
      return res.json({ result: 'No phone number' });
    }

    let cleanPhone = patientPhone.toString().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

    console.log('Sending SMS to:', cleanPhone);

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: `Confirmed! Hi ${patientName}, you are booked with ${doctorName} at City Square Dental on ${appointmentDateTime}. Address: 555 W 12th Ave #5, Vancouver. See you soon!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone
    });

    console.log('SMS SENT SUCCESSFULLY to:', cleanPhone);
    res.json({ result: 'SMS sent successfully' });

  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ result: error.message });
  }
});

app.post('/send-reminder', async (req, res) => {
  req.url = '/appointment-booked';
  app._router.handle(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
