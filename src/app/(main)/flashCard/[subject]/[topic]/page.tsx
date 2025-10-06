'use client'

import { useParams, useRouter } from 'next/navigation'

export default function TopicDetailPage() {
  const router = useRouter()
  const { subject, topic } = useParams()

  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold capitalize mb-3">
        {topic} ({subject})
      </h1>
      <p className="text-gray-600 mb-4">
        This topic page is still <span className="text-yellow-600 font-semibold">under construction</span>.
      </p>

      <button
        onClick={() => router.push(`/flashCard/${subject}`)}
        className="text-blue-600 hover:underline"
      >
        ← Back to {subject} Topics
      </button>
    </main>
  )
}
