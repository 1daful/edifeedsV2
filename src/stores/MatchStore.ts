import { set } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useMatchStore = defineStore('match', {
   state: () => ({
    matches: JSON.parse(localStorage.getItem('matches') ?? '[]'),
    admirers: JSON.parse(localStorage.getItem('admirers') ?? '[]'),
    favourites: JSON.parse(localStorage.getItem('favourites') ?? '[]'),
    conversations: JSON.parse(localStorage.getItem('conversations') ?? '[]')
  }),
  actions: {
    setMatches(matches) {
      this.matches = matches
      localStorage.setItem('matches', JSON.stringify(matches))
    },
    setFavourites(favourites) {
      this.favourites = favourites
      localStorage.setItem('favourites', JSON.stringify(favourites))
    },
    setConversations(conversations) {
      this.conversations = conversations
      localStorage.setItem('conversations', JSON.stringify(conversations))
    },
    setAdmirers(admirers) {
      this.admirers = admirers
      localStorage.setItem('admirers', JSON.stringify(admirers))
    },

    getMatch(id: string) {
      const matchStore = useMatchStore()
      const match = matchStore.matches.find(m => m.match_id === id)
      const favourite = matchStore.favourites.find(f => f.match_id === id)
      const admirer = matchStore.admirers.find(a => a.match_id === id)
      const isMatched = (match || favourite || admirer) ? true : false
    return { match, favourite, admirer, isMatched }
  }
  },
})
