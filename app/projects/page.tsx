"use client";
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowUpRight, Gamepad2, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { scrollAnimationVariants, slideInLeftVariants, slideInRightVariants, staggerContainer, hoverLiftVariants, hoverScaleVariants } from '../../lib/utils'

const projects = [
  {
    title: "Software",
    description: "Check out my software engineering projects",
    icon: Code2,
    items: [
      {
        slug: "beckohn-digital",
        title: "Beckohn Digital",
        description: "Startup web design company building modern, high-impact digital experiences.",
        tags: ["React", "Python", "UI/UX"],
        external: true,
        link: "https://beckohn.com"
      },
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="text-5xl font-bold text-white text-center mb-4"
            variants={scrollAnimationVariants}
          >
            My Projects
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-center mb-12 max-w-2xl mx-auto"
            variants={scrollAnimationVariants}
          >
            A collection of my work in software engineering and game development
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {/* Software on the left, Video Games on the right */}
          {projects.map((category, idx) => (
            <motion.div
              key={category.title}
              className={`space-y-6 ${idx === 0 ? 'order-1' : 'order-2'}`}
              variants={idx === 0 ? slideInLeftVariants : slideInRightVariants}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6"
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <category.icon className="w-8 h-8 text-blue-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">{category.title}</h2>
              </motion.div>
              <motion.p 
                className="text-gray-300 mb-6"
                variants={scrollAnimationVariants}
              >
                {category.description}
              </motion.p>
              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
              >
                {category.items.map((project, projectIndex) => (
                  <motion.div
                    key={project.slug}
                    variants={scrollAnimationVariants}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift">
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
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 45 }}
                            whileTap={{ scale: 0.9 }}
                          >
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
                          </motion.div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="flex flex-wrap gap-2"
                          variants={staggerContainer}
                        >
                          {project.tags.map((tag, tagIndex) => (
                            <motion.span 
                              key={tag}
                              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                              variants={scrollAnimationVariants}
                              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                              transition={{ duration: 0.2 }}
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

