import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

import cors from "cors";

const option = {
    origin: process.env.CORS_ORIGIN,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
app.use(cors(option));

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post("/webhook/razorpay", (req, res) => {
    const payload = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
        return res.status(400).send("Signature missing");
    }

    const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

    if (signature !== expectedSignature) {
        return res.status(400).send("Invalid signature");
    }

    console.log("Webhook event received:", req.body);

    // Check if the payment event is successful
    const event = req.body.event; // event type (payment.capture)
    const paymentStatus = req.body.payload.payment.entity.status; // Payment status (captured)

    if (event === "payment.captured" && paymentStatus === "captured") {
        // Payment was successful
        return res.status(200).send({ status: "success", message: "Payment captured successfully" });
    } else {
        // Payment failed or other events
        return res.status(200).send({ status: "failure", message: "Payment failed or event not handled" });
    }
});

app.get("/", (req, res) => {
    return res.send("This Shit is Working");
});

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});
