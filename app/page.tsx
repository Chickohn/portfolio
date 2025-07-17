"use client";
import { Button } from "../components/ui/button"
import Link from "next/link"
import { ArrowRight, Code2, Gamepad2, GraduationCap, Briefcase, Github, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollAnimationVariants, slideInLeftVariants, slideInRightVariants, staggerContainer, hoverLiftVariants, hoverScaleVariants } from '../lib/utils'
import Image from 'next/image'

export default function Home() {
  return (
    <>
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
            {/* Static avatar with subtle ring */}
            <div className="relative w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full ring-4 ring-blue-500 overflow-hidden">
              <Image
                src="/Profile-Picture-Cropped.jpg"
                alt="Freddie Kohn – Software Engineer and Game Developer"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 128px, 144px"
                quality={85}
              />
            </div>
            
            {/* Particle animation removed for performance */}
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight"
            variants={scrollAnimationVariants}
          >
            <span className="text-blue-400">Freddie Kohn</span>
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
                onClick={() => {
                  // Dispatch event for Nav component to handle
                  window.dispatchEvent(new CustomEvent('openContactModal'));
                }}
              >
                <span className="flex items-center justify-center gap-2">Contact Me</span>
              </Button>
            </motion.div>
            <motion.div variants={hoverScaleVariants} className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-yellow-500 text-gray-900 hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-900">
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
          
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-600/50 mb-8 md:mb-12"
            variants={scrollAnimationVariants}
            whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.7)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="text-gray-100 text-base md:text-lg leading-relaxed mb-4 md:mb-6"
              whileHover={{ color: "#f3f4f6" }}
              transition={{ duration: 0.3 }}
            >
              I'm a passionate Computer Science graduate with a focus on web development and software engineering. 
              My journey in tech has led me to create everything from interactive 3D games to highly responsive front-end applications, 
              always pushing the boundaries of what's possible.
            </motion.p>
            <motion.p 
              className="text-gray-100 text-base md:text-lg leading-relaxed"
              whileHover={{ color: "#f3f4f6" }}
              transition={{ duration: 0.3 }}
            >
              I'm currently working as a Web Developer at my startup{' '}
              <a href="https://beckohn.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200">
                Beckohn Digital
              </a>{' '}
              but am always looking for new opportunities to learn and grow.
            </motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-600/50"
              variants={slideInLeftVariants}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(31, 41, 55, 0.7)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-4 md:mb-6"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="motion-reduce-static"
                >
                  <GraduationCap className="w-8 md:w-10 h-8 md:h-10 text-blue-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Education</h3>
              </motion.div>
              <p className="text-gray-100 text-base md:text-lg leading-relaxed mb-2">
                Class I Bachelors Degree in Computer Science with Software Engineering
              </p>
              <p className="text-sm md:text-base text-gray-400">
                Graduated July 2024
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-600/50"
              variants={slideInRightVariants}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(31, 41, 55, 0.7)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-4 md:mb-6"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="motion-reduce-static"
                >
                  <Briefcase className="w-8 md:w-10 h-8 md:h-10 text-yellow-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Experience</h3>
              </motion.div>
              <p className="text-gray-100 text-base md:text-lg leading-relaxed mb-2">
                Web Development & Software Engineering
              </p>
              <p className="text-sm md:text-base text-gray-400">
                React, Python, C#, Full-Stack Development
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Skills Section - improved mobile layout */}
      <section className="py-12 md:py-20 px-4" role="region" aria-labelledby="skills-heading">
        <motion.div 
          className="max-w-6xl mx-auto"
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
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Programming Skills */}
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-600/50"
              variants={slideInLeftVariants}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(31, 41, 55, 0.7)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6 md:mb-8"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="motion-reduce-static"
                >
                  <Code2 className="w-8 md:w-10 h-8 md:h-10 text-blue-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Programming</h3>
              </motion.div>
              
              <motion.div 
                className="space-y-4 md:space-y-6"
                variants={staggerContainer}
              >
                {[
                  { name: 'Python', level: 100, color: 'bg-blue-500' },
                  { name: 'React', level: 90, color: 'bg-cyan-500' },
                  { name: 'C#', level: 90, color: 'bg-purple-500' },
                  { name: 'JavaScript', level: 60, color: 'bg-yellow-500' },
                  { name: 'Swift', level: 60, color: 'bg-orange-500' },
                  { name: '.NET', level: 60, color: 'bg-indigo-500' }
                ].map((skill, index) => (
                  <motion.div 
                    key={skill.name}
                    variants={scrollAnimationVariants}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-base md:text-lg font-semibold text-white">{skill.name}</h4>
                      <span className="text-gray-200 text-sm md:text-base">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 overflow-hidden">
                      <motion.div 
                        className={`h-full ${skill.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Game Development Skills */}
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-600/50"
              variants={slideInRightVariants}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(31, 41, 55, 0.7)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6 md:mb-8"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="motion-reduce-static"
                >
                  <Gamepad2 className="w-8 md:w-10 h-8 md:h-10 text-purple-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Game Development</h3>
              </motion.div>
              
              <motion.div 
                className="space-y-4 md:space-y-6"
                variants={staggerContainer}
              >
                {[
                  { name: 'Unity', level: 95, color: 'bg-gray-500' },
                  { name: 'AI Programming', level: 85, color: 'bg-green-500' },
                  { name: 'Game Design', level: 80, color: 'bg-pink-500' },
                  { name: 'Game Physics', level: 75, color: 'bg-red-500' },
                  { name: 'Unreal Engine', level: 40, color: 'bg-blue-500' },
                  { name: '3D Modeling', level: 30, color: 'bg-teal-500' }
                ].map((skill, index) => (
                  <motion.div 
                    key={skill.name}
                    variants={scrollAnimationVariants}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-base md:text-lg font-semibold text-white">{skill.name}</h4>
                      <span className="text-gray-200 text-sm md:text-base">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 overflow-hidden">
                      <motion.div 
                        className={`h-full ${skill.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
    </>
  );
}
