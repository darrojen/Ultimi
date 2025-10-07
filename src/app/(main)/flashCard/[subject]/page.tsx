'use client'

import { useRouter, useParams } from 'next/navigation'

export default function TopicsPage() {
  const router = useRouter()
  const { subject } = useParams()

  const topicsData: Record<string, string[]> = {
    mathematics: ['Algebra', 'Geometry', 'Calculus'],
    physics: ['Motion', 'Electricity', 'Waves'],
    chemistry: ['Atoms', 'Reactions', 'Equilibrium'],
  }

  const topics = topicsData[subject as string] || []

  const handleTopicClick = (topic: string) => {
    router.push(`/flashCard/${subject}/${topic.toLowerCase()}`)
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4 capitalize">{subject} Topics</h1>

      {topics.length > 0 ? (
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li
              key={topic}
              onClick={() => handleTopicClick(topic)}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              {topic}
            </li>
          ))}
        </ul>
      ) : (
        <p>No topics found for this subject.</p>
      )}

      <button
        onClick={() => router.push('/flashCard')}
        className="mt-6 text-gray-600 hover:underline"
      >
        ← Back to Subjects
      </button>
    </main>
  )
}
