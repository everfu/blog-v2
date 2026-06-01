import { createClient } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'
import { siteConfig } from '@/config/site'

export const isLiveblocksConfigured = Boolean(siteConfig.liveblocks.publicApiKey)

const client = createClient(
  siteConfig.liveblocks.publicApiKey
    ? { publicApiKey: siteConfig.liveblocks.publicApiKey }
    : { publicApiKey: 'pk_dev_disabled' }
)

export const {
  RoomProvider,
  useOthers,
  useSelf,
} = createRoomContext(client)
