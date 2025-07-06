import { BaseMedia } from '../utils/types'
import { getContent } from './mediaApi'
import { youtubeVideos } from './Resources'

export function calculatePopularity(item: BaseMedia): number {
  // External signals
  const viewWeight = 0.5
  const likeWeight = 1
  const commentWeight = 2

  // Internal signals
  const saveWeight = 1.5
  const internalLikeWeight = 1
  const shareWeight = 2

  const viewScore = (item.views ?? 0) * viewWeight
  const likeScore = (item.likes ?? 0) * likeWeight
  const commentScore = (item.commentCount ?? 0) * commentWeight
  const saveScore = (item.saves ?? 0) * saveWeight
  const internalLikeScore = (item.likes ?? 0) * internalLikeWeight
  const shareScore = (item.shares ?? 0) * shareWeight

  const popularityScore = viewScore + likeScore + commentScore + saveScore + internalLikeScore + shareScore

  // Recency boost (last 7 days)
  let recencyBoost = 1
  if (item.publishedAt) {
    const publishedDate = new Date(item.publishedAt)
    const daysSince = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince <= 7) recencyBoost = 1.3
    else if (daysSince <= 30) recencyBoost = 1.1
  }

  return popularityScore * recencyBoost
}

export async function getPopularMediaItems(limit = 5): Promise<BaseMedia[]> {
  const youtubeItems = await getContent(youtubeVideos)

  // Combine with books, quotes, etc. later
  const allItems = youtubeItems

  const sorted = allItems
    .map(item => ({
      ...item,
      popularityScore: calculatePopularity(item),
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit)

  return sorted
}
