export { getAdminHomeSections } from '@/server/content/application/admin'
export { getHomeSections } from '@/server/content/application/public'
export {
  DEFAULT_HERO_METADATA,
  DEFAULT_HOME_SECTIONS,
  mergeDefaultHomeSections,
  parseHeroMetadata,
  parseListMetadata,
} from '../contracts/config'
export type { AdminHomeSection, HomeSection } from '@/server/content/contracts/types'

