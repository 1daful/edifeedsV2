import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase' // Adjust path according to your setup

export const useMediaStore = defineStore('media', {
  state: () => ({
    media: [],
    loading: false,
    error: null,
    uploadProgress: {},
    categories: [
      'Images', 'Videos', 'Audio', 'Documents',
      'Design', 'Marketing', 'Archive', 'Other'
    ],
    tags: []
  }),

  getters: {
    mediaByCategory: (state) => (category) => {
      if (!category) return state.media
      return state.media.filter(item => item.category === category)
    },

    mediaByType: (state) => (type) => {
      return state.media.filter(item => item.type?.startsWith(type))
    },

    favoriteMedia: (state) => {
      return state.media.filter(item => item.favorite)
    },

    recentMedia: (state) => {
      return [...state.media]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
    },

    totalSize: (state) => {
      return state.media.reduce((total, item) => total + (item.size || 0), 0)
    },

    mediaStats: (state) => {
      const stats = {
        total: state.media.length,
        images: 0,
        videos: 0,
        audio: 0,
        documents: 0
      }

      state.media.forEach(item => {
        if (item.type?.startsWith('image/')) stats.images++
        else if (item.type?.startsWith('video/')) stats.videos++
        else if (item.type?.startsWith('audio/')) stats.audio++
        else stats.documents++
      })

      return stats
    }
  },

  actions: {
    /**
     * Fetch all media files
     */
    async fetchAllMedia() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('media')
          .select(`
            *,
            media_tags (
              tag_id,
              tags (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform the data to include tags as an array of strings
        this.media = data.map(item => ({
          ...item,
          tags: item.media_tags?.map(mt => mt.tags.name) || [],
          media_tags: undefined // Remove the nested structure
        }))

        // Extract unique tags
        this.extractTags()

        return this.media
      } catch (error) {
        console.error('Error fetching media:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Upload a single file
     */
    async uploadFile(file, options = {}, onProgress = null) {
      const fileId = Date.now().toString()

      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media-files')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100
              if (onProgress) onProgress(percentage)
            }
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media-files')
          .getPublicUrl(filePath)

        // Generate thumbnail for images and videos
        let thumbnailUrl = null
        if (options.generateThumbnails && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
          thumbnailUrl = await this.generateThumbnail(file)
        }

        // Save metadata to database
        const mediaData = {
          name: options.name || file.name,
          original_name: file.name,
          type: file.type,
          size: file.size,
          url: urlData.publicUrl,
          thumbnail_url: thumbnailUrl,
          storage_path: filePath,
          category: options.category || null,
          description: options.description || null,
          author: options.author || null,
          is_private: options.isPrivate || false,
          favorite: false,
          alt_text: options.altText || null,
          license: options.license || null,
          custom_fields: options.customFields || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: dbData, error: dbError } = await supabase
          .from('media')
          .insert(mediaData)
          .select()
          .single()

        if (dbError) throw dbError

        // Handle tags if provided
        if (options.tags && options.tags.length > 0) {
          await this.addTagsToMedia(dbData.id, options.tags)
          dbData.tags = options.tags
        }

        // Add to local state
        this.media.unshift(dbData)

        return dbData
      } catch (error) {
        console.error('Error uploading file:', error)
        throw error
      }
    },

    /**
     * Upload multiple files
     */
    async uploadMultipleFiles(files, options = {}, onProgress = null) {
      const results = []
      const total = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        try {
          const result = await this.uploadFile(file, options, (fileProgress) => {
            if (onProgress) {
              const overallProgress = ((i * 100) + fileProgress) / total
              onProgress(overallProgress, i, file.name)
            }
          })

          results.push(result)
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          results.push({ error: error.message, file: file.name })
        }
      }

      return results
    },

    /**
     * Update media metadata
     */
    async updateMedia(id, updates) {
      try {
        const { data, error } = await supabase
          .from('media')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Update tags if provided
        if (updates.tags) {
          await this.updateMediaTags(id, updates.tags)
          data.tags = updates.tags
        }

        // Update local state
        const index = this.media.findIndex(item => item.id === id)
        if (index !== -1) {
          this.media[index] = { ...this.media[index], ...data }
        }

        return data
      } catch (error) {
        console.error('Error updating media:', error)
        throw error
      }
    },

    /**
     * Delete media file
     */
    async deleteMedia(id) {
      try {
        // Get media data first to delete file from storage
        const media = this.media.find(item => item.id === id)
        if (!media) throw new Error('Media not found')

        // Delete file from storage
        if (media.storage_path) {
          const { error: storageError } = await supabase.storage
            .from('media-files')
            .remove([media.storage_path])

          if (storageError) {
            console.warn('Error deleting from storage:', storageError)
          }
        }

        // Delete thumbnail if exists
        if (media.thumbnail_url) {
          // Extract path from thumbnail URL and delete
          const thumbnailPath = this.extractPathFromUrl(media.thumbnail_url)
          if (thumbnailPath) {
            await supabase.storage
              .from('media-files')
              .remove([thumbnailPath])
          }
        }

        // Delete from database (cascading deletes will handle tags)
        const { error } = await supabase
          .from('media')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Remove from local state
        this.media = this.media.filter(item => item.id !== id)

        return true
      } catch (error) {
        console.error('Error deleting media:', error)
        throw error
      }
    },

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id) {
      try {
        const media = this.media.find(item => item.id === id)
        if (!media) throw new Error('Media not found')

        const newFavoriteStatus = !media.favorite

        const { data, error } = await supabase
          .from('media')
          .update({
            favorite: newFavoriteStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Update local state
        media.favorite = newFavoriteStatus

        return data
      } catch (error) {
        console.error('Error toggling favorite:', error)
        throw error
      }
    },

    /**
     * Add tags to media
     */
    async addTagsToMedia(mediaId, tagNames) {
      try {
        // First, ensure all tags exist
        for (const tagName of tagNames) {
          await this.ensureTagExists(tagName)
        }

        // Get tag IDs
        const { data: tags, error: tagsError } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', tagNames)

        if (tagsError) throw tagsError

        // Create media_tags relationships
        const mediaTagsData = tags.map(tag => ({
          media_id: mediaId,
          tag_id: tag.id
        }))

        const { error: relationError } = await supabase
          .from('media_tags')
          .insert(mediaTagsData)

        if (relationError) throw relationError

        return true
      } catch (error) {
        console.error('Error adding tags to media:', error)
        throw error
      }
    },

    /**
     * Update media tags
     */
    async updateMediaTags(mediaId, tagNames) {
      try {
        // Delete existing tags for this media
        await supabase
          .from('media_tags')
          .delete()
          .eq('media_id', mediaId)

        // Add new tags
        if (tagNames && tagNames.length > 0) {
          await this.addTagsToMedia(mediaId, tagNames)
        }

        return true
      } catch (error) {
        console.error('Error updating media tags:', error)
        throw error
      }
    },

    /**
     * Ensure tag exists, create if not
     */
    async ensureTagExists(tagName) {
      try {
        const { data: existingTag, error: selectError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (selectError && selectError.code !== 'PGRST116') {
          throw selectError
        }

        if (!existingTag) {
          const { data: newTag, error: insertError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single()

          if (insertError) throw insertError
          return newTag
        }

        return existingTag
      } catch (error) {
        console.error('Error ensuring tag exists:', error)
        throw error
      }
    },

    /**
     * Generate thumbnail for images and videos
     */
    async generateThumbnail(file) {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          // For images, create a thumbnail using canvas
          const img = new Image()
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          img.onload = () => {
            const maxSize = 200
            const ratio = Math.min(maxSize / img.width, maxSize / img.height)

            canvas.width = img.width * ratio
            canvas.height = img.height * ratio

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            canvas.toBlob((blob) => {
              if (blob) {
                // Upload thumbnail to storage
                this.uploadThumbnail(blob, file.name).then(resolve).catch(() => resolve(null))
              } else {
                resolve(null)
              }
            }, 'image/jpeg', 0.8)
          }

          img.onerror = () => resolve(null)
          img.src = URL.createObjectURL(file)

        } else if (file.type.startsWith('video/')) {
          // For videos, extract first frame
          const video = document.createElement('video')
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          video.onloadedmetadata = () => {
            video.currentTime = 1 // Get frame at 1 second
          }

          video.onseeked = () => {
            const maxSize = 200
            const ratio = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight)

            canvas.width = video.videoWidth * ratio
            canvas.height = video.videoHeight * ratio

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            canvas.toBlob((blob) => {
              if (blob) {
                this.uploadThumbnail(blob, file.name).then(resolve).catch(() => resolve(null))
              } else {
                resolve(null)
              }
            }, 'image/jpeg', 0.8)
          }

          video.onerror = () => resolve(null)
          video.src = URL.createObjectURL(file)

        } else {
          resolve(null)
        }
      })
    },

    /**
     * Upload thumbnail to storage
     */
    async uploadThumbnail(blob, originalFileName) {
      try {
        const fileName = `thumb_${Date.now()}_${originalFileName.split('.')[0]}.jpg`
        const filePath = `thumbnails/${fileName}`

        const { data, error } = await supabase.storage
          .from('media-files')
          .upload(filePath, blob)

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('media-files')
          .getPublicUrl(filePath)

        return urlData.publicUrl
      } catch (error) {
        console.error('Error uploading thumbnail:', error)
        return null
      }
    },

    /**
     * Extract unique tags from media
     */
    extractTags() {
      const tagSet = new Set()
      this.media.forEach(item => {
        if (item.tags) {
          item.tags.forEach(tag => tagSet.add(tag))
        }
      })
      this.tags = Array.from(tagSet).sort()
    },

    /**
     * Extract path from Supabase URL
     */
    extractPathFromUrl(url) {
      try {
        const urlParts = url.split('/')
        const storageIndex = urlParts.findIndex(part => part === 'storage')
        if (storageIndex !== -1 && urlParts[storageIndex + 2]) {
          return urlParts.slice(storageIndex + 3).join('/')
        }
        return null
      } catch (error) {
        return null
      }
    },

    /**
     * Search media
     */
    searchMedia(query, filters = {}) {
      let results = [...this.media]

      // Text search
      if (query) {
        const searchTerm = query.toLowerCase()
        results = results.filter(item =>
          item.name?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          item.author?.toLowerCase().includes(searchTerm)
        )
      }

      // Apply filters
      if (filters.type) {
        results = results.filter(item => item.type?.startsWith(filters.type))
      }

      if (filters.category) {
        results = results.filter(item => item.category === filters.category)
      }

      if (filters.favorite !== null) {
        results = results.filter(item => item.favorite === filters.favorite)
      }

      if (filters.dateRange) {
        const { from, to } = filters.dateRange
        results = results.filter(item => {
          const itemDate = new Date(item.created_at)
          return itemDate >= from && itemDate <= to
        })
      }

      return results
    },

    /**
     * Get media by ID
     */
    getMediaById(id) {
      return this.media.find(item => item.id === id)
    },

    /**
     * Bulk operations
     */
    async bulkDelete(ids) {
      const results = []
      for (const id of ids) {
        try {
          await this.deleteMedia(id)
          results.push({ id, success: true })
        } catch (error) {
          results.push({ id, success: false, error: error.message })
        }
      }
      return results
    },

    async bulkUpdateCategory(ids, category) {
      const results = []
      for (const id of ids) {
        try {
          await this.updateMedia(id, { category })
          results.push({ id, success: true })
        } catch (error) {
          results.push({ id, success: false, error: error.message })
        }
      }
      return results
    },

    async bulkAddTags(ids, tags) {
      const results = []
      for (const id of ids) {
        try {
          const media = this.getMediaById(id)
          const existingTags = media?.tags || []
          const newTags = [...new Set([...existingTags, ...tags])]
          await this.updateMedia(id, { tags: newTags })
          results.push({ id, success: true })
        } catch (error) {
          results.push({ id, success: false, error: error.message })
        }
      }
      return results
    }
  }
})
