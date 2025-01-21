import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

const projects = [
  {
    title: "Video Games",
    description: "Explore my game development projects",
    items: [
      { slug: "3d-asteroids", title: "3D Asteroids" },
      { slug: "swish-master", title: "Swish Master" },
    ]
  },
  {
    title: "Software",
    description: "Check out my software engineering projects",
    items: [
      { slug: "gym-buddy", title: "Gym Buddy" },
      { slug: "automated-fingerprint-identification-system", title: "Automated Fingerprint Identification System" },
    ]
  }
]

export default function Projects() {
  return (
    <div className="p-0">
      {/* Background */}
      <div
        className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"
      />

      {/* Content */}
      <div className="relative pl-4 pr-4 pt-8 mx-auto text-white">
        <h1 className="
          text-4xl 
          font-bold 
          mb-8
          left-4
          pt-4
          text-white
          text-center
          "
        >My Projects</h1>
        <div className="grid md:grid-cols-2 gap-6 pl-4 pr-4">
          {projects.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside">
                  {category.items.map((project) => (
                    <li key={project.slug}>
                      <Link href={`/projects/${project.slug}`} className="text-blue-600 hover:underline">
                        {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

