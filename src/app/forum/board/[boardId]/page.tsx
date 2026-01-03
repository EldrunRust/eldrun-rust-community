import { BoardClient } from '@/components/forum/BoardClient'

export const metadata = {
  title: 'Forum Board | ELDRUN',
  description: 'Eldrun Community Forum Board',
}

export default function BoardPage({ params }: { params: { boardId: string } }) {
  return <BoardClient boardId={params.boardId} />
}
