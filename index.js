const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.get('/', (req, res) => {
  res.send('Dental AI Server is running!');
});

app.post('/appointment-booked', async (req, res) => {
  console.log("RAW BODY:", JSON.stringify(req.body, null, 2));
  try {
    // Try Vapi tool call format first
    const toolCall = req.body.message?.toolCalls?.[0];
    let phone, name, doctor, time;

    if (toolCall) {
      let args = toolCall.function.arguments;
      if (typeof args === "string") args = JSON.parse(args);
      console.log("VAPI FORMAT ARGS:", args);
      phone = args.patientPhone;
      name = args.patientName;
      doctor = args.doctorName;
      time = args.appointmentDateTime;
    } else {
      // Direct call format
      console.log("DIRECT FORMAT");
      phone = req.body.patientPhone;
      name = req.body.patientName;
      doctor = req.body.doctorName;
      time = req.body.appointmentDateTime;
    }

    if (!phone) {
      console.log("NO PHONE NUMBER FOUND IN REQUEST");
      return res.json({ result: "Missing phone number" });
    }

    // Clean phone number
    let cleanPhone = phone.toString().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;
    console.log("SENDING SMS TO:", cleanPhone);

    const message = await client.messages.create({
      body: `Confirmed! Hi ${name}, you are booked with ${doctor} at City Square Dental on ${time}. Address: 555 W 12th Ave #5, Vancouver. See you soon!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone
    });

    console.log("SMS SENT:", message.sid);
    res.json({ result: "SMS sent successfully" });

  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ result: error.message });
  }
});

app.post('/send-reminder', async (req, res) => {
  req.body.patientPhone = req.body.patientPhone || req.body.phone;
  req.url = '/appointment-booked';
  app._router.handle(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
