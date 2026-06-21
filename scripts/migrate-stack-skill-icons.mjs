import { createClient } from '@supabase/supabase-js'

const ICON_MIGRATIONS = new Map([
  ['i-logos-visual-studio-code', 'vscode'],
  ['i-logos-sketch', null],
  ['i-simple-icons-bilibili', null],
  ['i-logos-notion-icon', 'notion'],
  ['i-logos-youtube-icon', null],
  ['i-ooui-logo-codex', null],
  ['i-logos-adobe-xd', 'xd'],
  ['i-devicon-androidstudio', 'androidstudio'],
  ['i-logos-netflix', null],
  ['i-logos-adobe-illustrator', 'ai'],
  ['i-logos-telegram', null],
  ['i-logos-xcode', 'apple'],
  ['i-logos-adobe-photoshop', 'ps'],
  ['i-logos-spotify', 'spotify'],
  ['i-icon-park-weixin-mini-app', null],
  ['i-logos-chrome', null],
])

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data: legacyItems, error: readError } = await supabase
  .from('stack_items')
  .select('id, name, icon')
  .eq('kind', 'software')
  .like('icon', 'i-%')

if (readError) throw readError

const unknownItems = (legacyItems || []).filter(item => !ICON_MIGRATIONS.has(item.icon))

if (unknownItems.length > 0) {
  const names = unknownItems.map(item => `${item.name} (${item.icon})`).join(', ')
  throw new Error(`Unknown legacy Stack icons; no rows changed: ${names}`)
}

const itemsByTarget = new Map()

for (const item of legacyItems || []) {
  const target = ICON_MIGRATIONS.get(item.icon)
  const key = target ?? '__NULL__'
  const ids = itemsByTarget.get(key) || []
  ids.push(item.id)
  itemsByTarget.set(key, ids)
}

for (const [key, ids] of itemsByTarget) {
  const icon = key === '__NULL__' ? null : key
  const { error: updateError } = await supabase
    .from('stack_items')
    .update({ icon })
    .in('id', ids)

  if (updateError) throw updateError
}

const { data: unresolvedItems, error: verifyError } = await supabase
  .from('stack_items')
  .select('name, icon')
  .eq('kind', 'software')
  .like('icon', 'i-%')

if (verifyError) throw verifyError

if ((unresolvedItems || []).length > 0) {
  throw new Error(`Migration verification failed for ${unresolvedItems.length} item(s)`)
}

console.log(`Stack icon migration complete: ${(legacyItems || []).length} item(s) updated`)
