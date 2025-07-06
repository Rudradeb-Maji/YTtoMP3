import { exec } from "child_process";

export function fetchYoutubeMetadataYTDLP(url) {
  return new Promise((resolve, reject) => {
    exec(`yt-dlp -j "${url}"`, (err, stdout) => {
      if (err) return reject(err);
      try {
        const info = JSON.parse(stdout);
        resolve(info);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}
