// index.js
const express = require("express");
const cors = require("cors"); 
const path = require("path");
const upload = require("./Storage"); 
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("./s3");
require("dotenv").config();

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

app.post("/image", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const fileUrl = req.file.location;
    res.json({
        success: true,
        message: "File uploaded successfully!",
        url: fileUrl,
    });
});

app.post("/upload-text", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false });
    }
    res.json({
        success: true,
        key: req.file.key 
    });
});

app.get("/image/:key", async (req, res) => {
    try {
        const key = `pfp/${req.params.key}`;
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
        });
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.redirect(signedUrl);
    } catch (err) {
        console.error(" Error generating signed URL:", err);
        res.status(500).send("Could not generate signed URL");
    }
});

app.get("/count-words/:key", async (req, res) => {
    try {
        const key = `files/${req.params.key}`;

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
        });

        const response = await s3.send(command);
        const body = await response.Body.transformToString();
        const words = body.trim().split(/\s+/);

        res.json({
            wordCount: words.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error reading file" });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});