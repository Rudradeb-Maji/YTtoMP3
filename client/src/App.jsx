import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [url, setUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoFetched, setInfoFetched] = useState(false);

  // Fetch video info
  const fetchVideoInfo = async (e) => {
    e.preventDefault();
    if (!link) return toast.error("Please enter a YouTube URL.");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/video-info", {
        url: link,
      });

      const { title, thumbnail } = res.data;
      setTitle(title);
      setThumbnail(thumbnail);
      setInfoFetched(true);
      toast.success("Video info fetched!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch video info.");
    } finally {
      setLoading(false);
    }
  };

  // Download + upload to Cloudinary
  const downloadAndUpload = async () => {
    if (!link) return toast.error("No video URL found.");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/download-and-upload",
        { url: link }
      );

      const { cloudinaryUrl, public_id } = res.data;
      setUrl(cloudinaryUrl);
      setPublicId(public_id);
      toast.success("Audio uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download and upload.");
    } finally {
      setLoading(false);
    }
  };

  // Delete uploaded audio
  const deleteDownload = async () => {
    if (!publicId) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/delete/${encodeURIComponent(publicId)}`
      );
      toast.success("Audio deleted from cloud");
      setUrl("");
      setPublicId("");
      setThumbnail("");
      setTitle("");
      setInfoFetched(false);
    } catch (err) {
      toast.error("Failed to delete from cloud.");
    }
  };

  // Download audio + delete from Cloudinary
  const triggerDownloadAndDelete = async () => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${title || "audio"}.mp3`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
      await deleteDownload();
    } catch (err) {
      toast.error("Failed to download file.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 relative">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          🎵 YouTube MP3 Downloader
        </h1>
        <p className="text-gray-500 text-sm">
          Paste your YouTube link, preview info, and download MP3
        </p>

        {/* Input */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (publicId) await deleteDownload();
            await fetchVideoInfo(e);
          }}
          className="space-y-4"
        >
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            type="text"
            placeholder="Paste YouTube URL"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-400 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={loading || !link}
            className={`w-full ${
              link
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-100 text-gray-400"
            } font-semibold rounded-lg py-3 transition text-sm`}
          >
            {loading ? "Processing..." : "Get Video Info"}
          </button>
        </form>

        {/* Video info preview */}
        {infoFetched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center space-y-3">
              {thumbnail && (
                <motion.img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-64 h-40 object-cover rounded-xl shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <motion.h2
                className="text-lg font-semibold text-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {title}
              </motion.h2>
            </div>

            {/* ✅ Hide green button once MP3 exists */}
            {!url && (
              <motion.button
                onClick={downloadAndUpload}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-3 transition text-sm"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Download MP3
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Audio player + Download button */}
        {url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <motion.audio
              src={url}
              controls
              className="w-full rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />

            <motion.button
              onClick={triggerDownloadAndDelete}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 transition text-sm"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Download MP3
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#000000d5] bg-opacity-40 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-6 border-purple-500 border-opacity-60"></div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
};

export default App;
