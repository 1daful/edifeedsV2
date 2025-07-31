import { backEndApi, bibleApi, youtube } from "./apiList";
/*export const youtubeVideos: Resource = {
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
}*/
export const youtubeVideosReq = youtube.makeRequest({
    endPoint: "/search",
    params: {
        part: "snippet",
        chart: "mostPopular",
        maxResults: 10,
    },
    method: "get",
    transform: (item) => ({
        id: item.id.videoId ?? item.id.channelId ?? item.id.playlistId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
    })
});
export const bibleVerseReq = bibleApi.makeRequest({
    endPoint: "/verse",
    method: "get"
});
export const callBack = backEndApi.makeRequest({
    endPoint: import.meta.env.VITE_CALLBACK_URL,
    data: [youtubeVideosReq],
    method: "post"
});
