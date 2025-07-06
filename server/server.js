// import express from "express";
// import cors from "cors";
// import { exec } from "child_process";
// import { Readable } from "stream";
// import { uploadAudioToCloudinary } from "./services/uploadToCloudinary.js";
// import { deleteAudioFromCloudinary } from "./services/deleteFromCloudinary.js";

// const app = express();
// app.use(express.json());
// app.use(cors());

// app.post("/api/download-and-upload", (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required" });

//   const cleanUrl = url.split("?")[0];

//   // Fetch metadata (if you still want title)
//   const infoCommand = `yt-dlp -j "${cleanUrl}"`;

//   exec(infoCommand, (err, stdout) => {
//     if (err) {
//       console.error("Metadata fetch error:", err);
//       return res.status(500).json({ error: "Video info fetch failed." });
//     }

//     let videoInfo;
//     try {
//       videoInfo = JSON.parse(stdout);
//     } catch (e) {
//       return res.status(500).json({ error: "Video info parse error." });
//     }

//     const title = videoInfo.title.replace(/[^\w\s]/gi, "") || "audio";
//     const thumbnail = videoInfo.thumbnail;
//     // Use bestaudio universally
//     const ytCommand = `yt-dlp -f bestaudio -o - "${cleanUrl}"`;

//     const child = exec(ytCommand, { encoding: "buffer", maxBuffer: Infinity });

//     const audioStream = Readable.from(child.stdout);

//     uploadAudioToCloudinary(audioStream, title)
//       .then((result) => {
//         res.json({
//           message: "Upload complete",
//           cloudinaryUrl: result.secure_url,
//           public_id: result.public_id,
//           title,thumbnail
//         });
//       })
//       .catch((uploadErr) => {
//         console.error("Upload error:", uploadErr);
//         res.status(500).json({ error: "Cloud upload failed." });
//       });

//     child.stderr.on("data", (data) => {
//       console.error("yt-dlp stderr:", data.toString());
//     });
//   });
// });

// // Delete from Cloudinary
// app.delete("/api/delete/:publicId", async (req, res) => {
//   const { publicId } = req.params;
//   try {
//     const result = await deleteAudioFromCloudinary(publicId);
//     res.json({ message: "File deleted successfully", result });
//   } catch (err) {
//     console.error("Delete error:", err);
//     res.status(500).json({ error: "Cloud delete failed." });
//   }
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

import express from "express";
import cors from "cors";
import fs from "fs";
import { exec } from "child_process";
import { Readable } from "stream";
import { uploadAudioToCloudinary } from "./services/uploadToCloudinary.js";
import { deleteAudioFromCloudinary } from "./services/deleteFromCloudinary.js";
import { extractVideoId } from "./lib/extractId.js";
import { fetchYoutubeVideoData } from "./lib/fetchYoutubeVideoData.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/downloads", express.static("downloads"));

// app.post("/api/download-and-upload", (req, res) => {
//   const { url } = req.body;
//   console.log(url);
//  const videoId = extractVideoId(url);

//   if (!videoId) {
//     return res.status(400).json({ error: "Invalid YouTube URL" });
//   }

//   const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
//   // Ensure downloads folder exists
//   if (!fs.existsSync("downloads")) {
//     fs.mkdirSync("downloads");
//   }

//   // Download and convert to mp3
//   const outputTemplate = "downloads/%(title)s.%(ext)s";
//   const command = `yt-dlp -x --audio-format mp3 -o "${outputTemplate}" ${cleanUrl}`;

//   exec(command, (err, stdout, stderr) => {
//     if (err) {
//       console.error(stderr);
//       return res.status(500).json({ error: stderr });
//     }

//     // Find the downloaded file name from stdout or fs (since yt-dlp names it based on video title)
//     // For simplicity, let's pick the latest file in downloads folder
//     const files = fs.readdirSync("downloads").filter((f) => f.endsWith(".mp3"));
//     const latestFile = files.sort(
//       (a, b) =>
//         fs.statSync(`downloads/${b}`).mtime -
//         fs.statSync(`downloads/${a}`).mtime
//     )[0];

//     // Send back the file URL
//     res.json({
//       message: "Download complete",
//       fileUrl: `/downloads/${encodeURIComponent(latestFile)}`,
//     });
//   });
// });

// app.post("/api/download-and-upload", (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required" });
//   const videoId = extractVideoId(url);

//   if (!videoId) {
//     return res.status(400).json({ error: "Invalid YouTube URL" });
//   }

//   const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
// const infoCommand = `yt-dlp --get-title --user-agent "Mozilla/5.0" --referer "https://www.youtube.com/" "${url}"`;
//   exec(infoCommand, (err, stdout) => {
//     if (err) {
//       console.error("Metadata fetch error:", err);
//       return res.status(500).json({ error: "Failed to fetch video info." });
//     }

//     let videoInfo;
//     try {
//       videoInfo = JSON.parse(stdout);
//     } catch (parseErr) {
//       console.error("Video info parse error:", parseErr);
//       return res.status(500).json({ error: "Video info parse error." });
//     }

//     let title = videoInfo.title
//       .replace(/[<>:"/\\|?*]/g, "") // remove invalid filename characters only
//       .trim();

//     const thumbnail = videoInfo.thumbnail;

//     // Smart fallback: best audio-only (prefer m4a) or best overall
//     // const ytCommand = `yt-dlp -f "bestaudio[ext=m4a]/bestaudio/best" -o - --user-agent "Mozilla/5.0" --referer "https://www.youtube.com/" "${url}"`;
//     const ytCommand = `yt-dlp -x --audio-format mp3 -o- ${cleanUrl}`;
//     const child = exec(ytCommand, { encoding: "buffer", maxBuffer: Infinity });
//     const audioStream = Readable.from(child.stdout);

//     uploadAudioToCloudinary(audioStream, title)
//       .then((result) => {
//         res.json({
//           message: "Upload complete",
//           cloudinaryUrl: result.secure_url,
//           public_id: result.public_id,
//           title,
//           thumbnail,
//         });
//       })
//       .catch((uploadErr) => {
//         console.error("Upload error:", uploadErr);
//         res.status(500).json({ error: "Cloud upload failed." });
//       });

//     child.stderr.on("data", (data) =>
//       console.error("yt-dlp stderr:", data.toString())
//     );
//   });
// });
// app.post("/api/download-and-upload", async (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required" });

//   const videoId = extractVideoId(url);
//   if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

//   const videoMeta = await fetchYoutubeVideoData(videoId);
//   if (!videoMeta)
//     return res.status(500).json({ error: "Failed to fetch video metadata" });

//   // Clean title for file name
//   const safeTitle = videoMeta.title.replace(/[<>:"/\\|?*]/g, "").trim();

//   const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
//   const ytCommand = `yt-dlp -x --audio-format mp3 -o- ${cleanUrl}`;

//   const child = exec(ytCommand, { encoding: "buffer", maxBuffer: Infinity });
//   const audioStream = Readable.from(child.stdout);

//   uploadAudioToCloudinary(audioStream, safeTitle)
//     .then((result) => {
//       res.json({
//         message: "Upload complete",
//         cloudinaryUrl: result.secure_url,
//         public_id: result.public_id,
//         title: videoMeta.title,
//         thumbnail: videoMeta.thumbnail,
//       });
//     })
//     .catch((uploadErr) => {
//       console.error("Upload error:", uploadErr);
//       res.status(500).json({ error: "Cloud upload failed." });
//     });

//   child.stderr.on("data", (data) =>
//     console.error("yt-dlp stderr:", data.toString())
//   );
// });
app.post("/api/download-and-upload", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const ytCommand = `yt-dlp -x --audio-format mp3 -o- ${cleanUrl}`;

  try {
    const child = exec(ytCommand, { encoding: "buffer", maxBuffer: Infinity });
    const audioStream = Readable.from(child.stdout);

    const result = await uploadAudioToCloudinary(audioStream, videoId); // you can use videoId or a static string if you prefer

    res.json({
      message: "Upload complete",
      cloudinaryUrl: result.secure_url,
      public_id: result.public_id,
    });

    child.stderr.on("data", (data) =>
      console.error("yt-dlp stderr:", data.toString())
    );
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Cloud upload failed." });
  }
});

app.post("/api/video-info", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const videoIdMatch = url.match(
    /(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

  try {
    const info = await fetchYoutubeVideoData(videoId);
    res.json(info);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch video info." });
  }
});
app.delete("/api/delete/:publicId", async (req, res) => {
  const { publicId } = req.params;
  try {
    const result = await deleteAudioFromCloudinary(publicId);
    res.json({ message: "File deleted successfully", result });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Cloud delete failed." });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
