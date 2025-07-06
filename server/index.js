import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

let videoId = "";

const searchData = {
  context: {
    client: {
      clientName: "WEB",
      clientVersion: "2.20210721.00.00",
    },
  },
  query: "ishq ne pakad li kalai hai meri",
};

const searchHeaders = {
  "Content-Type": "application/json",
  "X-YouTube-Client-Name": "1",
  "X-YouTube-Client-Version": "2.20210721.00.00",
};

// ✅ Fetch video metadata using youtubei/v1/player
async function fetchYoutubeVideoData(videoId) {
  try {
    const playerUrl = `https://www.youtube.com/youtubei/v1/player?prettyPrint=false`;

    const payload = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20210721.00.00",
        },
      },
      videoId: videoId,
    };

    const headers = {
      "Content-Type": "application/json",
      "X-YouTube-Client-Name": "1",
      "X-YouTube-Client-Version": "2.20210721.00.00",
    };

    const res = await axios.post(playerUrl, payload, { headers });

    const videoDetails = res.data.videoDetails;

    console.log("🎥 Video Title:", videoDetails.title);
    console.log("🖼️ Thumbnail URL:", videoDetails.thumbnail.thumbnails.at(-1).url);
    console.log("👤 Channel:", videoDetails.author);
    console.log("⏳ Duration (sec):", videoDetails.lengthSeconds);

    return {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnail.thumbnails.at(-1).url,
      author: videoDetails.author,
      duration: videoDetails.lengthSeconds,
    };
  } catch (error) {
    console.error("❌ Error fetching video metadata:", error.response?.data || error.message);
  }
}

async function searchYouTube() {
  try {
    const searchRes = await axios.post(
      "https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
      searchData,
      { headers: searchHeaders }
    );

    const videoId =
      searchRes.data.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .videoRenderer.videoId;

    return videoId;
  } catch (error) {
    console.error("Error searching YouTube:", error.response?.data || error.message);
  }
}

async function getYouTubeShareLink(videoId) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(videoUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector('ytd-menu-renderer button[aria-label="Share"]', {
    timeout: 15000,
  });

  await page.click('ytd-menu-renderer button[aria-label="Share"]');

  await page.waitForSelector("input#share-url", { timeout: 10000 });

  const shareLink = await page.$eval("input#share-url", (el) => el.value);

  console.log("📎 Share Link:", shareLink);

  await browser.close();
  return shareLink;
}

// ▶️ Driver
videoId = await searchYouTube();
if (videoId) {
  console.log("✅ Found Video ID:", videoId);

  const videoMeta = await fetchYoutubeVideoData(videoId);
  console.log("✅ Video Metadata:", videoMeta);

  await getYouTubeShareLink(videoId);
}
