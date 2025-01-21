import { Button } from "../components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="p-0">
      {/* Background */}
      <div
        className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"
      />

      {/* Content */}
      <div className="pt-8 px-4">
        {/* Add top padding so content clears the fixed nav bar */}
        <div className="pt-4 mx-auto">
          {/* Semi-transparent “card” for text */}
          <div className="bg-white bg-opacity-60 left-0 right-0 rounded-md p-8 shadow-lg pt-8">
            <h1 className="text-4xl font-bold mb-4">Freddie Kohn&apos;s Portfolio</h1>
            <p className="mb-4">
              I&apos;m a passionate Computer Science student with a focus on 
              game development and software engineering. My projects range from 
              interactive 3D games to practical software solutions.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Qualifications</h2>
            <ul className="list-disc list-inside mb-4">
              <li>Bachelor of Science in Computer Science (Expected graduation: 2024)</li>
              <li>Proficient in C++, Python, and JavaScript</li>
              <li>Experience with Unity and Unreal Engine</li>
              <li>Strong background in algorithms and data structures</li>
            </ul>
            <Button asChild>
              <Link href="/projects">View My Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
