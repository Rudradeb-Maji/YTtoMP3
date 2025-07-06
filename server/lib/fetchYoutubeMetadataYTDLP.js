import ytdlp from "yt-dlp-exec";

export async function fetchYoutubeMetadataYTDLP(url) {
  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true, // returns parsed JSON, no need to parse stdout
    });
    console.log(info);

    return info;
  } catch (err) {
    console.error("❌ yt-dlp metadata fetch error:", err);
    throw err;
  }
}
