export interface IUser {
  avatar_asset_id: string | null
  avatar_url: string
  confirmed_at: string | null
  created_at: string
  email: string
  first_name: string
  id: string
  last_name: string
  provider: string
  theme_preference: 'light' | 'dark' | 'system'
  updated_at: string
  username: string | null
  verified: boolean
  verified_at: string
}
