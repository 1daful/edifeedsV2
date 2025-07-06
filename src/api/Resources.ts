import { youtube } from "./apiConfig"
import { ApiRequest, Resource } from "@edifiles/services";

const getResource = (api: any) => {

}

export const youtubeVideos: Resource = {
  get: {
    response:  youtube.get({
      url: "/search",
      config: {
        part: "snippet",
        chart: "mostPopular",
        maxResults: 10,
      }
    }),

    transform: (item: any) => ({
      id: item.id.videoId ?? item.id.channelId ?? item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    })
  },
}

