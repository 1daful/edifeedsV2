import { RestClient } from "@edifiles/services";
import { Video } from "../utils/types";
import { getContent } from "./mediaApi";
const youtube = new RestClient({
    baseUrl: "https://www.googleapis.com/youtube/v3",
    baseConfig: {
        key: import.meta.env.VITE_YOUTUBE_API_KEY,
    },
    requests: {}, // Add an empty requests object or define your API requests here
});
export const getYoutubeVideos = async (): Promise<Video[]> => {
  const config = {
    url: "/videos",
    config: {
        part: "snippet",
        chart: "mostPopular",
        maxResults: 10,
    },
  }
  const videos = await getContent(config, youtube, (data: any) => {
    return {
      type: 'Video',
      id: data.id,
      title: data.snippet.title,
      description: data.snippet.description,

    }
  })
  return videos
};
