import { apiBible, backEndApi, bibleApi, youtube } from "./apiList"
import { ApiRequest } from "@edifiles/services";

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

export const youtubeVideosReq: ApiRequest = youtube.makeRequest({
  endPoint: "/search",
  params: {
    part: "snippet",
    chart: "mostPopular",
    maxResults: 10,
    q: 'christian and gospel'
  },
  method: "get",
  transform: (item: any) => ({
    id: item.id.videoId ?? item.id.channelId ?? item.id.playlistId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  })
})

export const bibleReq: ApiRequest = apiBible.makeRequest({
  endPoint: "/bibles",
  method: "get"
})

export const bibleBooksReq: ApiRequest = apiBible.makeRequest({
  endPoint: "/books",
  method: "get"
})

export const bibleChapterReq: ApiRequest = apiBible.makeRequest({
  endPoint: "/chapters",
  method: "get"
})

export const bibleVerseReq: ApiRequest = apiBible.makeRequest({
  endPoint: "/verses",
  method: "get"
})
export const randomVerse: ApiRequest = bibleApi.makeRequest({
  endPoint: "/data/web/random",
  method: "get"
})

export const callBack = backEndApi.makeRequest({
  endPoint: import.meta.env.VITE_CALLBACK_URL,
  data: [youtubeVideosReq],
  method: "post"
})
