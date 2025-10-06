'use client'

import { useRouter } from 'next/navigation'

export default function SubjectsPage() {
  const router = useRouter()
  const subjects = ['Mathematics', 'Physics', 'Chemistry']

  const handleSubjectClick = (subject: string) => {
    router.push(`/flashCard/${subject.toLowerCase()}`)
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">Subjects</h1>

      <ul className="space-y-3">
        {subjects.map((subject) => (
          <li
            key={subject}
            onClick={() => handleSubjectClick(subject)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            {subject}
          </li>
        ))}
      </ul>
    </main>
  )
}
