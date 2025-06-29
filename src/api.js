import { RestClient } from "@edifiles/services";
const youtube = new RestClient({
    baseUrl: "https://www.googleapis.com/youtube/v3",
    baseConfig: {
        key: import.meta.env.VITE_YOUTUBE_API_KEY,
    },
    requests: {}, // Add an empty requests object or define your API requests here
});
export const youtubeVideos = youtube.get({
    url: "/videos",
    config: {
        part: "snippet",
        chart: "mostPopular",
        maxResults: 10,
    },
});
