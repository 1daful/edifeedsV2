export const config = {
  supabase: {
    id: 'https://ugcptzmdhziywxlrvhqg.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY3B0em1kaHppeXd4bHJ2aHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDE3OTksImV4cCI6MjA2NTQxNzc5OX0.heZx8v2D0huvRu-igXJDR3z9ilnXRGh61UqNWOkW2Eo'
  }
}

export const appConfig = {
  name: 'Edifeeds',
  version: '1.0.0',
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.edifeeds.com',
  itemsPerPage: 12
}
