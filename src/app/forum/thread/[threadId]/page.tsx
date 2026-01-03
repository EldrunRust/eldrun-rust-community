import { ThreadClient } from '@/components/forum/ThreadClient'

export const metadata = {
  title: 'Thread | ELDRUN Forum',
  description: 'Eldrun Community Forum Thread',
}

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  return <ThreadClient threadId={params.threadId} />
}
