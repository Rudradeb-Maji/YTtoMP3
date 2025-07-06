import axios from "axios";

export async function fetchYoutubeVideoData(videoId) {
  try {
    const playerUrl = `https://www.youtube.com/youtubei/v1/player?prettyPrint=false`;

    const payload = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20210721.00.00",
        },
      },
      videoId,
    };

    const headers = {
      "Content-Type": "application/json",
      "X-YouTube-Client-Name": "1",
      "X-YouTube-Client-Version": "2.20210721.00.00",
    };

    const res = await axios.post(playerUrl, payload, { headers });

    const videoDetails = res.data.videoDetails;

    return {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnail.thumbnails.at(-1).url,
    };
  } catch (error) {
    console.error("❌ Error fetching video metadata:", error.response?.data || error.message);
    return null;
  }
}
