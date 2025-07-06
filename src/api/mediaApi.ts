import { ApiConfig, ApiRequest, RestClient } from "@edifiles/services";
import { getYoutubeVideos } from "./youtube";
import { Resource } from "@edifiles/services/dist/module/utility/Types";
//import { getTodayQuote } from "./zenQuotes";
//import { searchBooks } from "./googleBooks";

export const aggregator: Record<string, any> = {}

export interface AggregatedContent {
  videos: [];
  quote: string;
  books: [];
}

export async function getContent(resource: Resource): Promise<any> {
  //let data: any[] = await client.get(reso).data;
  const data = resource.get.response
  const transform = resource.get.transform

  let mediaContents
  if(transform) {
    mediaContents = resource.get.response.map((dat: any) => {
      transform(dat)
    })
  }

  else {
    mediaContents = data
  }

  /*const [videosRes] = await Promise.all([
    youtubeVideos,
    //getTodayQuote(),
    //searchBooks(query),
  ]);*/

  return mediaContents
    //videos: videosRes.data.items ?? [],
    //quote: quoteRes.data[0] ?? null,
    //books: booksRes.data.items ?? [],
  ;
}

export const getAggregatedContent = async (query: string): Promise<any> => {
  const videos = await Promise.all([
    getYoutubeVideos()
  ])

  const aggregatedContent: AggregatedContent = {
    videos: videos,
  }

  return aggregatedContent
}
