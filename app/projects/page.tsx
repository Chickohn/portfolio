import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowUpRight, Gamepad2, Code2 } from 'lucide-react'

const projects = [
  {
    title: "Software",
    description: "Check out my software engineering projects",
    icon: Code2,
    items: [
      {
        slug: "https://sportsanalysis.kohn.me.uk",
        title: "Analysis Tool",
        description: "Sports performance analysis platform",
        tags: ["Web", "Analytics", "Data Visualization"]
      },
      {
        slug: "browns-road-garage-website",
        title: "Browns Road Garage Website",
        description: "A website I developed for a local garage",
        tags: ["HTML/CSS", "PHP", "WordPress"],
        external: true,
        link: "https://www.brownsrdgaragesurbiton.co.uk"
      },
      {
        slug: "gym-buddy",
        title: "Gym Buddy",
        description: "Personal fitness tracking and workout planning app",
        tags: ["React", "TypeScript", "Node.js"],
        link: "https://github.com/Chickohn/GymBuddyApp/tree/main"
      }
    ]
  },
  {
    title: "Video Games",
    description: "Explore my game development projects",
    icon: Gamepad2,
    items: [
      {
        slug: "3d-asteroids",
        title: "3D Asteroids",
        description: "A modern take on the classic arcade game",
        tags: ["Unity", "C#", "3D"]
      },
      {
        slug: "swish-master",
        title: "Swish Master",
        description: "Basketball shooting game with physics-based gameplay",
        tags: ["Unity", "C#", "Physics"]
      },
    ]
  }
]

export default function Projects() {
  return (
    <div className="min-h-screen">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/70 -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          My Projects
        </h1>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          A collection of my work in software engineering and game development
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Software on the left, Video Games on the right */}
          {projects.map((category, idx) => (
            <div
              key={category.title}
              className={`space-y-6 ${idx === 0 ? 'order-1' : 'order-2'}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <category.icon className="w-8 h-8 text-blue-500" />
                <h2 className="text-3xl font-bold text-white">{category.title}</h2>
              </div>
              <p className="text-gray-300 mb-6">{category.description}</p>
              <div className="space-y-4">
                {category.items.map((project) => (
                  <Card key={project.slug} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-white">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="text-gray-300 mt-2">
                            {project.description}
                          </CardDescription>
                        </div>
                        {/* External link for Browns Road Garage Website, otherwise use default logic */}
                        {project.link ? (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <ArrowUpRight className="w-6 h-6" />
                          </a>
                        ) : project.slug.startsWith('http') ? (
                          <a 
                            href={project.slug} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <ArrowUpRight className="w-6 h-6" />
                          </a>
                        ) : (
                          <Link 
                            href={`/projects/${project.slug}`}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <ArrowUpRight className="w-6 h-6" />
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

