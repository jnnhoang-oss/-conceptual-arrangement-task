// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json({ limit: "5mb" }));

// Replace with your own values:
const GITHUB_TOKEN = "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";
const GITHUB_REPO = "jnnhoang-oss/-conceptual-arrangement-task";
const GITHUB_PATH = "data"; // folder inside the repo where CSVs go

app.post("/upload-csv", async (req, res) => {
  try {
    const { csvContent, participantID } = req.body;
    const filename = `${GITHUB_PATH}/arrangement_${participantID}.csv`;

    // Convert CSV to base64 for GitHub API
    const content = Buffer.from(csvContent).toString("base64");

    // Make GitHub API request
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "ExperimentUploader"
      },
      body: JSON.stringify({
        message: `Upload participant ${participantID}`,
        content,
      })
    });

    if (!response.ok) throw new Error(await response.text());
    res.status(200).json({ message: "Uploaded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("->>> Server running on port 3000"));
