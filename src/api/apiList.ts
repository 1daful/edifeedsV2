import { Api, EAuth, Repository, SDKClient, SupabaseDb, SupabaseRepo } from "@edifiles/services";
/*export const youtube = new RestClient({
  baseUrl: "https://www.googleapis.com/youtube/v3",
  baseConfig: {
    key: import.meta.env.VITE_YOUTUBE_API_KEY,
  },
  requests: {}, // Add an empty requests object or define your API requests here
});*/

export const youtube = new Api({
  endPoint: "https://www.googleapis.com/youtube/v3",
  params: {
    key: import.meta.env.VITE_YOUTUBE_API_KEY,
    id: import.meta.env.VITE_YOUTUBE_API_id,
  }
})

export const backEndApi: Api = new Api({
  endPoint: import.meta.env.VITE_BACKEND_API_URL,
  params: {}
})

export const dailymotion: Api = new Api({
  endPoint: 'https://api.dailymotion.com',
  params: {}
})

export const bibleApi: Api = new Api({
  endPoint: 'https://api.scripture.api.bible/v1/bibles',
  params: {
    key: import.meta.env.VITE_BIBLE_API_KEY
  }
})

const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_API_URL,
  key: import.meta.env.VITE_SUPABASE_API_KEY
}
export const dbClient = new SDKClient(new SupabaseDb(supabaseConfig))

export const auth = new EAuth(supabaseConfig)
