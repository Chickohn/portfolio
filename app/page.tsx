"use client";
import { useState } from 'react';
import { Button } from "../components/ui/button"
import Link from "next/link"
import { ArrowRight, Code2, Gamepad2, GraduationCap, Briefcase, Github, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollAnimationVariants, slideInLeftVariants, slideInRightVariants, staggerContainer, hoverLiftVariants, hoverScaleVariants } from '../lib/utils'
import Image from 'next/image'
import Nav from '../components/nav';

function ClientRoot() {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <Nav onContactClick={() => setShowContact(true)} />
      <Home onContactClick={() => setShowContact(true)} />
      <AnimatePresence>
        {showContact && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowContact(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/80 shadow-2xl backdrop-blur-xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 text-2xl font-bold focus:outline-none transition-colors duration-200"
                onClick={() => setShowContact(false)}
                aria-label="Close contact panel"
              >
                ×
              </motion.button>
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-extrabold mb-2 text-white text-center tracking-tight"
              >
                Let's Connect!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 mb-6 text-center text-base"
              >
                I'd love to hear from you. Feel free to reach out or connect with me on LinkedIn.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6"/></svg>
                  <span className="font-semibold text-white">Email:</span>
                  <a href="mailto:freddiej.kohn@gmail.com" className="text-yellow-400 hover:underline break-all transition-colors duration-200">freddiej.kohn@gmail.com</a>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/></svg>
                  <span className="font-semibold text-white">LinkedIn:</span>
                  <a href="https://www.linkedin.com/in/freddie-j-kohn/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline transition-colors duration-200">@freddie-j-kohn</a>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <span className="inline-block bg-yellow-400/10 text-yellow-300 px-4 py-2 rounded-full font-medium border border-yellow-400/30 shadow-sm tracking-wide">
                  Open to new opportunities and collaborations!
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ClientRoot;

function Home({ onContactClick }: { onContactClick: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/70 -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex items-center">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Profile Picture */}
            <motion.div
              className="flex justify-center mb-8"
              variants={scrollAnimationVariants}
            >
              <motion.div
                className="relative flex items-center justify-center w-36 h-36"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                style={{ minWidth: '9rem', minHeight: '9rem' }}
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 p-1 animate-pulse-slow" style={{ zIndex: 1 }}>
                  <div className="rounded-full bg-black p-1">
                    {/* Inner gradient ring */}
                    <div className="rounded-full bg-gradient-to-r from-blue-400 to-purple-400 p-1">
                      {/* Profile image container */}
                      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        <Image
                          src="/Profile-Picture-Cropped.jpg"
                          alt="Freddie Kohn"
                          fill
                          className="object-cover rounded-full"
                          priority
                        />
                        {/* Subtle overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating particles effect (kept inside the profile area) */}
                <motion.div
                  className="absolute top-2 right-2 w-4 h-4 bg-blue-400 rounded-full opacity-60"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ zIndex: 2 }}
                />
                <motion.div
                  className="absolute bottom-2 left-2 w-3 h-3 bg-purple-400 rounded-full opacity-60"
                  animate={{
                    y: [0, 10, 0],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  style={{ zIndex: 2 }}
                />
              </motion.div>
            </motion.div>

            <motion.h1 
              className="text-6xl font-bold text-white mb-6"
              variants={scrollAnimationVariants}
            >
              Freddie Kohn
            </motion.h1>
            <motion.p 
              className="text-2xl text-gray-300 mb-8"
              variants={scrollAnimationVariants}
            >
              Computer Science Graduate & Software Engineer
            </motion.p>
            <motion.div 
              className="flex gap-4 justify-center mb-12"
              variants={staggerContainer}
            >
              <motion.div variants={hoverScaleVariants}>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/projects" className="flex items-center gap-2">
                    View Projects <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div variants={hoverScaleVariants}>
                <Button size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={onContactClick}>
                  <span className="flex items-center gap-2">Contact Me</span>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex justify-center gap-6"
              variants={staggerContainer}
            >
              <motion.a 
                href="https://github.com/Chickohn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="w-6 h-6" />
              </motion.a>
              <motion.a 
                href="https://www.linkedin.com/in/freddie-j-kohn/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-6 h-6" />
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover-lift"
              variants={hoverLiftVariants}
            >
              <motion.h2 
                className="text-3xl font-bold text-white mb-6"
                variants={scrollAnimationVariants}
              >
                About Me
              </motion.h2>
              <motion.p 
                className="text-gray-300 text-lg mb-6"
                variants={scrollAnimationVariants}
              >
                I&apos;m a passionate Computer Science graduate with a focus on web development and software engineering. 
                My journey in tech has led me to create everything from interactive 3D games to highly responsive front-end applications, 
                always pushing the boundaries of what&apos;s possible. 
                I&apos;m currently working as a Web Developer at my startup <a href="https://beckohn.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline transition-colors duration-200">Beckohn Digital</a> but 
                am always looking for new opportunities to learn and grow.
              </motion.p>
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
              >
                <motion.div 
                  className="flex items-start gap-4"
                  variants={slideInLeftVariants}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <GraduationCap className="w-6 h-6 text-blue-500 mt-1" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Education</h3>
                    <p className="text-gray-300">
                      Class I Bachelors Degree in Computer Science with Software Engineering
                      <br />
                      <span className="text-sm text-gray-400">Graduated July 2024</span>
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start gap-4"
                  variants={slideInRightVariants}
                  whileHover={{ x: -5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Briefcase className="w-6 h-6 text-blue-500 mt-1" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Experience</h3>
                    <p className="text-gray-300">
                      Web Development & Software Engineering
                      <br />
                      <span className="text-sm text-gray-400">React, Python, C#, Full-Stack Development</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Skills Section */}
        <section className="py-20">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-3xl font-bold text-white text-center mb-12"
              variants={scrollAnimationVariants}
            >
              Technical Skills
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={staggerContainer}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover-lift"
                variants={slideInLeftVariants}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Code2 className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white">Programming</h3>
                </motion.div>
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                >
                  {[
                    { name: 'Python', level: '100%' },
                    { name: 'React', level: '90%' },
                    { name: 'C#', level: '90%' },
                    { name: 'JavaScript', level: '60%' },
                    { name: 'Swift', level: '60%' },
                    { name: '.NET', level: '60%' }
                  ].map((skill, index) => (
                    <motion.div 
                      key={skill.name} 
                      className="flex items-center justify-between"
                      variants={scrollAnimationVariants}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-gray-300">{skill.name}</span>
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: skill.level }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover-lift"
                variants={slideInRightVariants}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Gamepad2 className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white">Game Development</h3>
                </motion.div>
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                >
                  {[
                    { name: 'Unity', level: '95%' },
                    { name: 'AI Programming', level: '85%' },
                    { name: 'Game Design', level: '80%' },
                    { name: 'Game Physics', level: '75%' },
                    { name: 'Unreal Engine', level: '40%' },
                    { name: '3D Modeling', level: '30%' }
                  ].map((skill, index) => (
                    <motion.div 
                      key={skill.name} 
                      className="flex items-center justify-between"
                      variants={scrollAnimationVariants}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-gray-300">{skill.name}</span>
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: skill.level }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
