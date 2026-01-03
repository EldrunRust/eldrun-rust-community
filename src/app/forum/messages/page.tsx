import { MessagesClient } from '@/components/forum/MessagesClient'

export const metadata = {
  title: 'Nachrichten | ELDRUN Forum',
  description: 'Deine privaten Nachrichten im Eldrun Community Forum',
}

export default function MessagesPage() {
  return <MessagesClient />
}
