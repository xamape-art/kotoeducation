// Only these accounts can use the admin panel. Keep in sync with is_admin() in supabase/migrations/004_admin_only.sql
export const ADMIN_USER_IDS = [
  'ce3a16c5-f846-4a10-ad13-a8f60d613504', // kotoeducation@gmail.com
  'ef93623d-d6f0-44e4-a591-fe9287111dae', // xamape@gmail.com
]

export function isAdmin(user: { id: string } | null | undefined) {
  return !!user && ADMIN_USER_IDS.includes(user.id)
}
