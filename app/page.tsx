import { Button } from "../components/ui/button"
import Link from "next/link"
import { ArrowRight, Code2, Gamepad2, GraduationCap, Briefcase, Github, Linkedin } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/70 -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex items-center">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              Freddie Kohn
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Computer Science Graduate & Software Engineer
            </p>
            <div className="flex gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/projects" className="flex items-center gap-2">
                  View Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Link href="#contact" className="flex items-center gap-2">
                  Contact Me
                </Link>
              </Button>
            </div>
            <div className="flex justify-center gap-6">
              <a href="https://github.com/Chickohn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/freddie-j-kohn/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6">About Me</h2>
              <p className="text-gray-300 text-lg mb-6">
                I&apos;m a passionate Computer Science graduate with a focus on game development and software engineering. 
                My journey in tech has led me to create everything from interactive 3D games to practical software solutions, 
                always pushing the boundaries of what&apos;s possible.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Education</h3>
                    <p className="text-gray-300">
                      Class I Bachelors Degree in Computer Science with Software Engineering
                      <br />
                      <span className="text-sm text-gray-400">Graduated July 2024</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Briefcase className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Experience</h3>
                    <p className="text-gray-300">
                      Game Development & Software Engineering
                      <br />
                      <span className="text-sm text-gray-400">Unity, Unreal Engine, Full-Stack Development</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Technical Skills</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Code2 className="w-8 h-8 text-blue-500" />
                  <h3 className="text-2xl font-semibold text-white">Programming</h3>
                </div>
                <div className="space-y-4">
                  {['C#', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js'].map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-gray-300">{skill}</span>
                      <div className="w-32 h-2 bg-white/10 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <Gamepad2 className="w-8 h-8 text-blue-500" />
                  <h3 className="text-2xl font-semibold text-white">Game Development</h3>
                </div>
                <div className="space-y-4">
                  {['Unity', 'Unreal Engine', '3D Modeling', 'Game Physics', 'AI Programming'].map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-gray-300">{skill}</span>
                      <div className="w-32 h-2 bg-white/10 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Let&apos;s Connect</h2>
            <p className="text-gray-300 mb-8">
              I&apos;m always interested in hearing about new projects and opportunities.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href="mailto:freddiej.kohn@gmail.com" className="flex items-center gap-2">
                Get in Touch
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
