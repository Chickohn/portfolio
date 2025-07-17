"use client";
import { useState } from 'react';
import { Button } from "./ui/button"
import Link from "next/link"
import { ArrowRight, Code2, Gamepad2, GraduationCap, Briefcase, Github, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollAnimationVariants, slideInLeftVariants, slideInRightVariants, staggerContainer, hoverLiftVariants, hoverScaleVariants } from '../lib/utils'
import Image from 'next/image'
import Nav from './nav';

export default function ClientHome() {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <Nav onContactClick={() => setShowContact(true)} />
      <HomeContent onContactClick={() => setShowContact(true)} />
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
              className="relative w-full max-w-md mx-4 p-6 md:p-8 rounded-2xl border border-gray-600/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 shadow-2xl backdrop-blur-xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 text-gray-300 hover:text-yellow-400 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded transition-colors duration-200"
                onClick={() => setShowContact(false)}
                aria-label="Close contact panel"
              >
                ×
              </motion.button>
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-extrabold mb-2 text-white text-center tracking-tight"
              >
                Let's Connect!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-100 mb-6 text-center text-sm md:text-base"
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
                  <svg className="w-4 md:w-5 h-4 md:h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6"/>
                  </svg>
                  <span className="font-semibold text-white text-sm md:text-base">Email:</span>
                  <a 
                    href="mailto:freddiej.kohn@gmail.com" 
                    className="text-yellow-300 hover:text-yellow-200 hover:underline text-xs md:text-sm break-all transition-colors duration-200 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                  >
                    freddiej.kohn@gmail.com
                  </a>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3"
                >
                  <svg className="w-4 md:w-5 h-4 md:h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/>
                  </svg>
                  <span className="font-semibold text-white text-sm md:text-base">LinkedIn:</span>
                  <a 
                    href="https://www.linkedin.com/in/freddie-j-kohn/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-300 hover:text-blue-200 hover:underline text-sm transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                  >
                    @freddie-j-kohn
                  </a>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 md:mt-8 text-center"
              >
                <span className="inline-block bg-yellow-400/20 text-yellow-200 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium border border-yellow-400/40 shadow-sm tracking-wide">
                  Open to new opportunities and collaborations!
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function HomeContent({ onContactClick }: { onContactClick: () => void }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background - using warmer off-black */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900/80 to-gray-950/90 -z-10" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center text-white px-4 min-h-screen" role="banner">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Image */}
          <motion.div 
            variants={scrollAnimationVariants}
            className="relative mb-8"
          >
            <motion.div 
              className="relative w-32 h-32 mx-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {/* Outer rotating ring - disabled on mobile */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 motion-reduce-static"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                style={{ 
                  padding: '3px',
                  // Disable rotation on mobile to prevent motion issues
                  animationPlayState: typeof window !== 'undefined' && window.innerWidth < 768 ? 'paused' : 'running'
                }}
              >
                <div className="w-full h-full rounded-full bg-gray-900"></div>
              </motion.div>
              
              {/* Inner ring - disabled on mobile */}
              <motion.div
                className="absolute inset-1 rounded-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500 motion-reduce-static"
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                style={{ 
                  padding: '2px',
                  // Disable rotation on mobile to prevent motion issues
                  animationPlayState: typeof window !== 'undefined' && window.innerWidth < 768 ? 'paused' : 'running'
                }}
              >
                <div className="w-full h-full rounded-full bg-gray-900"></div>
              </motion.div>

              {/* Profile image */}
              <div className="absolute inset-3 rounded-full overflow-hidden">
                <Image
                  src="/random.jpeg"
                  alt="Freddie Kohn - Software Engineer and Game Developer"
                  fill
                  className="object-cover"
                  priority
                  sizes="128px"
                  quality={85}
                />
              </div>

              {/* Floating particles - only on desktop and respects motion preferences */}
              <div className="hidden md:block motion-reduce-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-70"
                    style={{
                      top: '50%',
                      left: '50%',
                      marginTop: '-4px',
                      marginLeft: '-4px',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                      opacity: [0.7, 0.3, 0.7],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight"
            variants={scrollAnimationVariants}
          >
            <motion.span 
              className="bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              Freddie Kohn
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl text-gray-100 mb-8 font-light"
            variants={scrollAnimationVariants}
          >
            Computer Science Graduate &<br />
            <motion.span 
              className="text-yellow-300 font-medium"
              whileHover={{ color: "#fbbf24" }}
              transition={{ duration: 0.3 }}
            >
              Software Engineer
            </motion.span>
          </motion.p>
          
          {/* CTA Buttons - improved mobile layout */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4"
            variants={staggerContainer}
          >
            <motion.div variants={hoverScaleVariants} className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                <Link href="/projects" className="flex items-center justify-center gap-2">
                  View Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={hoverScaleVariants} className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto border-gray-300 bg-gray-800/80 text-gray-100 hover:bg-gray-700/80 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900" 
                onClick={onContactClick}
              >
                <span className="flex items-center justify-center gap-2">Contact Me</span>
              </Button>
            </motion.div>
            <motion.div variants={hoverScaleVariants} className="w-full sm:w-auto">
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-yellow-400 text-yellow-300 hover:bg-yellow-500 hover:text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                <a href="/Freddie_Kohn_Resume.pdf" download className="flex items-center justify-center gap-2">
                  📄 Download Resume
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex justify-center gap-6"
            variants={staggerContainer}
          >
            <motion.a 
              href="https://github.com/Chickohn" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-300 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded p-1"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Visit Freddie Kohn's GitHub profile"
            >
              <Github className="w-6 h-6" />
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/freddie-j-kohn/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-300 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded p-1"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Visit Freddie Kohn's LinkedIn profile"
            >
              <Linkedin className="w-6 h-6" />
            </motion.a>
            <motion.a 
              href="mailto:freddiej.kohn@gmail.com" 
              className="text-gray-300 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded p-1"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Send email to Freddie Kohn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6"/>
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section - improved mobile spacing */}
      <section className="py-12 md:py-20 px-4 bg-gray-900/50" role="region" aria-labelledby="about-heading">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 
            id="about-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 md:mb-16"
            variants={scrollAnimationVariants}
          >
            About Me
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div variants={slideInLeftVariants}>
              <motion.h3 
                className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
              >
                My Journey
              </motion.h3>
              <motion.p 
                className="text-gray-100 text-base md:text-lg leading-relaxed mb-4 md:mb-6"
                whileHover={{ color: "#f3f4f6" }}
                transition={{ duration: 0.3 }}
              >
                I'm a passionate Computer Science graduate with a deep love for creating innovative software solutions 
                and immersive gaming experiences. My journey in technology spans from developing complex algorithms 
                to crafting engaging user interfaces.
              </motion.p>
              <motion.p 
                className="text-gray-100 text-base md:text-lg leading-relaxed"
                whileHover={{ color: "#f3f4f6" }}
                transition={{ duration: 0.3 }}
              >
                With expertise in multiple programming languages and frameworks, I enjoy tackling challenging problems 
                and bringing creative ideas to life through code.
              </motion.p>
            </motion.div>
            
            <motion.div 
              variants={slideInRightVariants}
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              {[
                { icon: GraduationCap, title: "Education", text: "Computer Science Graduate", color: "text-blue-400" },
                { icon: Code2, title: "Development", text: "Full-Stack Engineering", color: "text-green-400" },
                { icon: Gamepad2, title: "Gaming", text: "Game Development", color: "text-purple-400" },
                { icon: Briefcase, title: "Experience", text: "Professional Projects", color: "text-yellow-400" }
              ].map((item, index) => (
                <motion.div 
                  key={item.title}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-600/50"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(31, 41, 55, 0.9)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="motion-reduce-static"
                  >
                    <item.icon className={`w-8 md:w-12 h-8 md:h-12 ${item.color} mb-3 md:mb-4`} />
                  </motion.div>
                  <h4 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{item.title}</h4>
                  <p className="text-gray-100 text-sm md:text-base">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Skills Section - improved mobile layout */}
      <section className="py-12 md:py-20 px-4" role="region" aria-labelledby="skills-heading">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 
            id="skills-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12 md:mb-16"
            variants={scrollAnimationVariants}
          >
            Technical Skills
          </motion.h2>
          
          {/* Skill badges for quick scanning - improved mobile layout */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12"
            variants={staggerContainer}
          >
            {['Python', 'Unity', 'C#', 'React', 'JavaScript', 'Swift', '.NET', 'Node.js', 'TypeScript', 'Git'].map((skill, index) => (
              <motion.span 
                key={skill}
                className="px-3 md:px-4 py-1 md:py-2 bg-blue-600/30 text-blue-100 rounded-full text-xs md:text-sm border border-blue-400/50 hover:bg-blue-600/40 transition-colors cursor-default"
                variants={scrollAnimationVariants}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 0.5)" }}
                transition={{ duration: 0.2 }}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.div 
            className="space-y-6 md:space-y-8"
            variants={staggerContainer}
          >
            {[
              { name: "Python", level: 100, color: "bg-blue-500" },
              { name: "React & C#", level: 90, color: "bg-green-500" },
              { name: "JavaScript & Swift & .NET", level: 60, color: "bg-yellow-500" }
            ].map((skill, index) => (
              <motion.div key={skill.name} variants={scrollAnimationVariants}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg md:text-xl font-semibold text-white">{skill.name}</h3>
                  <span className="text-gray-200 text-sm md:text-base">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 overflow-hidden">
                  <motion.div 
                    className={`h-full ${skill.color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
} 