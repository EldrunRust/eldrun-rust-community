import { useStore } from '@/store/useStore'
import { useForumStore } from '@/store/forumStore'

// XP Rewards for Forum Activities
const FORUM_XP_REWARDS = {
  createThread: 50,
  createReply: 20,
  receiveReaction: 5,
  giveReaction: 2,
  markBestAnswer: 100,
  receiveBestAnswer: 150,
  dailyLogin: 10,
  firstPostOfDay: 25,
  reachMilestone: {
    posts10: 100,
    posts50: 250,
    posts100: 500,
    posts500: 1500,
    posts1000: 5000,
  }
}

// Achievement definitions for Forum Activities
const FORUM_ACHIEVEMENTS = {
  firstPost: { id: 'forum_first_post', name: 'Erste Worte', icon: '💬', points: 50 },
  tenPosts: { id: 'forum_10_posts', name: 'Gesprächig', icon: '🗣️', points: 100 },
  fiftyPosts: { id: 'forum_50_posts', name: 'Aktiver Diskutierer', icon: '📝', points: 250 },
  hundredPosts: { id: 'forum_100_posts', name: 'Forum-Veteran', icon: '⭐', points: 500 },
  fiveHundredPosts: { id: 'forum_500_posts', name: 'Forum-Elite', icon: '💎', points: 1500 },
  thousandPosts: { id: 'forum_1000_posts', name: 'Forum-Legende', icon: '🔥', points: 5000 },
  firstThread: { id: 'forum_first_thread', name: 'Themenstarter', icon: '📌', points: 75 },
  popularThread: { id: 'forum_popular_thread', name: 'Trendsetter', icon: '🔥', points: 300 },
  helpfulMember: { id: 'forum_helpful_member', name: 'Hilfreicher Geist', icon: '🤝', points: 500 },
  reactionKing: { id: 'forum_reaction_king', name: 'Reaktionskönig', icon: '👑', points: 250 },
  shoutboxChatter: { id: 'forum_shoutbox_chatter', name: 'Plaudertasche', icon: '💭', points: 100 },
}

export function useForumRewards() {
  const { currentUser, addXP, unlockAchievement, addUserActivity, updateUserProfile } = useStore()
  const { userForumProfile, updateUserForumProfile } = useForumStore()

  // Reward for creating a new thread
  const rewardCreateThread = () => {
    if (!currentUser) return

    addXP(FORUM_XP_REWARDS.createThread)
    
    addUserActivity({
      type: 'achievement',
      message: 'Neues Forum-Thema erstellt (+50 XP)'
    })

    // Check for first thread achievement
    if (userForumProfile && userForumProfile.threadCount === 0) {
      unlockAchievement(FORUM_ACHIEVEMENTS.firstThread)
    }

    // Update forum profile
    updateUserForumProfile({
      threadCount: (userForumProfile?.threadCount || 0) + 1
    })
  }

  // Reward for creating a reply
  const rewardCreateReply = () => {
    if (!currentUser) return

    addXP(FORUM_XP_REWARDS.createReply)

    addUserActivity({
      type: 'achievement',
      message: 'Forum-Beitrag verfasst (+20 XP)'
    })

    const newPostCount = (userForumProfile?.postCount || 0) + 1

    // Check milestones
    checkPostMilestone(newPostCount)

    // Update forum profile
    updateUserForumProfile({
      postCount: newPostCount,
      lastPostAt: new Date()
    })
  }

  // Reward for receiving a reaction
  const rewardReceiveReaction = () => {
    if (!currentUser) return

    addXP(FORUM_XP_REWARDS.receiveReaction)
    
    // Update reputation
    updateUserForumProfile({
      reputation: (userForumProfile?.reputation || 0) + 1
    })
  }

  // Reward for giving a reaction
  const rewardGiveReaction = () => {
    if (!currentUser) return
    addXP(FORUM_XP_REWARDS.giveReaction)
  }

  // Reward for having your answer marked as best
  const rewardBestAnswer = () => {
    if (!currentUser) return

    addXP(FORUM_XP_REWARDS.receiveBestAnswer)
    
    addUserActivity({
      type: 'achievement',
      message: 'Beste Antwort erhalten! (+150 XP)'
    })

    // Update reputation significantly
    updateUserForumProfile({
      reputation: (userForumProfile?.reputation || 0) + 25
    })

    // Check for helpful member achievement (e.g., 5 best answers)
    // This would need tracking in the profile
  }

  // Reward for marking best answer
  const rewardMarkBestAnswer = () => {
    if (!currentUser) return
    addXP(FORUM_XP_REWARDS.markBestAnswer)
  }

  // Check post milestones and unlock achievements
  const checkPostMilestone = (postCount: number) => {
    if (!currentUser) return

    if (postCount === 1) {
      unlockAchievement(FORUM_ACHIEVEMENTS.firstPost)
      addXP(50) // Bonus for first post
    }
    if (postCount === 10) {
      unlockAchievement(FORUM_ACHIEVEMENTS.tenPosts)
      addXP(FORUM_XP_REWARDS.reachMilestone.posts10)
    }
    if (postCount === 50) {
      unlockAchievement(FORUM_ACHIEVEMENTS.fiftyPosts)
      addXP(FORUM_XP_REWARDS.reachMilestone.posts50)
    }
    if (postCount === 100) {
      unlockAchievement(FORUM_ACHIEVEMENTS.hundredPosts)
      addXP(FORUM_XP_REWARDS.reachMilestone.posts100)
    }
    if (postCount === 500) {
      unlockAchievement(FORUM_ACHIEVEMENTS.fiveHundredPosts)
      addXP(FORUM_XP_REWARDS.reachMilestone.posts500)
    }
    if (postCount === 1000) {
      unlockAchievement(FORUM_ACHIEVEMENTS.thousandPosts)
      addXP(FORUM_XP_REWARDS.reachMilestone.posts1000)
    }
  }

  // Reward for shoutbox activity
  const rewardShoutboxMessage = () => {
    if (!currentUser) return
    addXP(5) // Small XP for shoutbox messages
  }

  // Daily login reward for forum
  const rewardDailyForumVisit = () => {
    if (!currentUser) return
    
    // Check if already rewarded today
    const lastVisit = localStorage.getItem('eldrun_forum_last_visit')
    const today = new Date().toDateString()
    
    if (lastVisit !== today) {
      addXP(FORUM_XP_REWARDS.dailyLogin)
      localStorage.setItem('eldrun_forum_last_visit', today)
      
      addUserActivity({
        type: 'achievement',
        message: 'Täglicher Forum-Besuch (+10 XP)'
      })
    }
  }

  return {
    rewardCreateThread,
    rewardCreateReply,
    rewardReceiveReaction,
    rewardGiveReaction,
    rewardBestAnswer,
    rewardMarkBestAnswer,
    rewardShoutboxMessage,
    rewardDailyForumVisit,
    FORUM_XP_REWARDS,
    FORUM_ACHIEVEMENTS
  }
}

// Forum-specific achievements to add to the main store
export const FORUM_ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'forum_first_post',
    name: 'Erste Worte',
    description: 'Verfasse deinen ersten Forum-Beitrag',
    icon: '💬',
    points: 50,
    category: 'forum'
  },
  {
    id: 'forum_10_posts',
    name: 'Gesprächig',
    description: 'Verfasse 10 Forum-Beiträge',
    icon: '🗣️',
    points: 100,
    category: 'forum'
  },
  {
    id: 'forum_50_posts',
    name: 'Aktiver Diskutierer',
    description: 'Verfasse 50 Forum-Beiträge',
    icon: '📝',
    points: 250,
    category: 'forum'
  },
  {
    id: 'forum_100_posts',
    name: 'Forum-Veteran',
    description: 'Verfasse 100 Forum-Beiträge',
    icon: '⭐',
    points: 500,
    category: 'forum'
  },
  {
    id: 'forum_500_posts',
    name: 'Forum-Elite',
    description: 'Verfasse 500 Forum-Beiträge',
    icon: '💎',
    points: 1500,
    category: 'forum'
  },
  {
    id: 'forum_1000_posts',
    name: 'Forum-Legende',
    description: 'Verfasse 1000 Forum-Beiträge',
    icon: '🔥',
    points: 5000,
    category: 'forum'
  },
  {
    id: 'forum_first_thread',
    name: 'Themenstarter',
    description: 'Erstelle dein erstes Forum-Thema',
    icon: '📌',
    points: 75,
    category: 'forum'
  },
  {
    id: 'forum_popular_thread',
    name: 'Trendsetter',
    description: 'Erstelle ein Thema mit über 50 Antworten',
    icon: '🔥',
    points: 300,
    category: 'forum'
  },
  {
    id: 'forum_helpful_member',
    name: 'Hilfreicher Geist',
    description: 'Erhalte 5 "Beste Antwort" Markierungen',
    icon: '🤝',
    points: 500,
    category: 'forum'
  },
  {
    id: 'forum_reaction_king',
    name: 'Reaktionskönig',
    description: 'Erhalte 100 Reaktionen auf deine Beiträge',
    icon: '👑',
    points: 250,
    category: 'forum'
  },
  {
    id: 'forum_shoutbox_chatter',
    name: 'Plaudertasche',
    description: 'Sende 50 Shoutbox-Nachrichten',
    icon: '💭',
    points: 100,
    category: 'forum'
  }
]
