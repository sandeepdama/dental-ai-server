const express = require("express");
const twilio = require("twilio");

const app = express();

// Middleware (VERY IMPORTANT)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Health check (optional but useful)
app.get("/", (req, res) => {
    res.send("Server is running");
});

// MAIN ROUTE (Vapi will call this)
app.post("/appointment-booked", async (req, res) => {
    console.log("RAW BODY:", req.body);

    let data = req.body;

    // Handle Vapi sending arguments as string
    if (typeof data.arguments === "string") {
        try {
            data = JSON.parse(data.arguments);
        } catch (err) {
            console.error("JSON parse error:", err);
            return res.status(400).send("Invalid JSON");
        }
    }

    const phone = data.patientPhone;
    const name = data.patientName;
    const doctor = data.doctorName;
    const time = data.appointmentDateTime;

    if (!phone) {
        console.log("NO PHONE NUMBER IN REQUEST");
        return res.status(400).send("Missing phone number");
    }

    try {
        const message = await client.messages.create({
            body: `Hi ${name}, your appointment with ${doctor} is confirmed for ${time}.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        console.log("SMS SENT:", message.sid);

        res.send("SMS sent successfully");
    } catch (error) {
        console.error("SMS ERROR:", error);
        res.status(500).send("Failed to send SMS");
    }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
