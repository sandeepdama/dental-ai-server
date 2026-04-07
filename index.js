app.post('/appointment-booked', async (req, res) => {
    console.log("RAW BODY:", JSON.stringify(req.body, null, 2));

    try {
        const toolCall = req.body.message?.toolCalls?.[0];

        if (!toolCall) {
            console.log("❌ No tool call found");
            return res.send("No tool call");
        }

        let args = toolCall.function.arguments;

        // If arguments is string → parse it
        if (typeof args === "string") {
            args = JSON.parse(args);
        }

        console.log("PARSED ARGS:", args);

        const phone = args.patientPhone;
        const name = args.patientName;
        const doctor = args.doctorName;
        const time = args.appointmentDateTime;

        if (!phone) {
            console.log("❌ NO PHONE NUMBER FOUND");
            return res.send("Missing phone");
        }

        console.log("✅ PHONE:", phone);

        const message = await client.messages.create({
            body: `Hi ${name}, your appointment with ${doctor} is confirmed for ${time}.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        console.log("✅ SMS SENT:", message.sid);

        res.send("SMS sent successfully");

    } catch (error) {
        console.error("❌ ERROR:", error);
        res.send("Error handled");
    }
});
