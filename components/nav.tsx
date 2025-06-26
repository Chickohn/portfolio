"use client";
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export default function Nav({ onContactClick }: { onContactClick?: () => void }) {
  const [showContact, setShowContact] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      const shouldShowScrollTop = window.scrollY > 400;
      setScrolled(isScrolled);
      setShowScrollTop(shouldShowScrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`
          fixed 
          top-8
          right-20
          left-20
          z-50 
          bg-gray-900
          text-white 
          shadow-lg
          rounded-full
          transition-all duration-300 ease-in-out
          ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-xl' : 'bg-gray-900'}
        `}
      >
        <header className="flex justify-between items-center px-8 py-4 bg-transparent rounded-full">
          <motion.h1 
            className="text-lg font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Freddie Kohn
          </motion.h1>
          <nav className="space-x-4">
            <motion.div className="inline-block">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
              >
                <span>Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            <motion.div className="inline-block">
              <Link 
                href="/projects" 
                className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
              >
                <span>Projects</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            <motion.div className="inline-block">
              <Link 
                href="/skills" 
                className="text-gray-300 hover:text-white transition-colors duration-300 relative group"
              >
                <span>Skills</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition-all duration-300 hover:shadow-lg"
              onClick={onContactClick ? onContactClick : () => setShowContact(true)}
            >
              Contact
            </motion.button>
          </nav>
        </header>
      </motion.nav>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {onContactClick ? null : showContact && (
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
  )
}
