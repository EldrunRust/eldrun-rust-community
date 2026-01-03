'use client'

import { ContentItem } from '@/data/infiniteContent'
import { NewsCard } from './sections/NewsCard'
import { TutorialCard } from './sections/TutorialCard'
import { TipCard } from './sections/TipCard'
import { ForumThreadCard } from './sections/ForumThreadCard'
import { ClanSpotlight } from './sections/ClanSpotlight'
import { PlayerSpotlight } from './sections/PlayerSpotlight'
import { ServerEventCard } from './sections/ServerEventCard'
import { GalleryCard } from './sections/GalleryCard'
import { PollCard } from './sections/PollCard'
import { StatsHighlight } from './sections/StatsHighlight'
import { GuideCard } from './sections/GuideCard'
import { UpdateLogCard } from './sections/UpdateLogCard'
import { CommunityPost } from './sections/CommunityPost'
import { LeaderboardMini } from './sections/LeaderboardMini'
import { FactionWarSupport } from './sections/FactionWarSupport'

interface ContentRendererProps {
  item: ContentItem
  index: number
}

export function ContentRenderer({ item, index }: ContentRendererProps) {
  // Add leaderboard after every 5 items as a special section
  const showLeaderboard = index > 0 && index % 7 === 0

  const renderContent = () => {
    switch (item.type) {
      case 'news':
        return <NewsCard data={item.data as any} />
      case 'tutorial':
        return <TutorialCard data={item.data as any} />
      case 'tip':
        return <TipCard data={item.data as any} />
      case 'forum_thread':
        return <ForumThreadCard data={item.data as any} />
      case 'clan_spotlight':
        return <ClanSpotlight data={item.data as any} />
      case 'player_spotlight':
        return <PlayerSpotlight data={item.data as any} />
      case 'server_event':
        return <ServerEventCard data={item.data as any} />
      case 'gallery':
        return <GalleryCard data={item.data as any} />
      case 'poll':
        return <PollCard data={item.data as any} />
      case 'stats_highlight':
        return <StatsHighlight data={item.data as any} />
      case 'guide':
        return <GuideCard data={item.data as any} />
      case 'update_log':
        return <UpdateLogCard data={item.data as any} />
      case 'community_post':
        return <CommunityPost data={item.data as any} />
      case 'faction_war':
        return <FactionWarSupport />
      default:
        return null
    }
  }

  return (
    <>
      {showLeaderboard && <LeaderboardMini />}
      {renderContent()}
    </>
  )
}
