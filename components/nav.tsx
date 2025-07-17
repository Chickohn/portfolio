"use client";
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Menu, X } from 'lucide-react'

export default function Nav({ onContactClick }: { onContactClick?: () => void }) {
  const [showContact, setShowContact] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleContactModal = () => setShowContact(true);
    window.addEventListener('openContactModal', handleContactModal);
    return () => window.removeEventListener('openContactModal', handleContactModal);
  }, []);

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

  const handleMobileContactClick = () => {
    setIsMobileMenuOpen(false);
    if (onContactClick) {
      onContactClick();
    } else {
      setShowContact(true);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`
          fixed 
          top-8
          right-4 sm:right-8 lg:right-20
          left-4 sm:left-8 lg:left-20
          z-50 
          bg-gray-900
          text-white 
          shadow-lg
          rounded-full
          transition-all duration-300 ease-in-out
          hidden md:block
          ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-xl' : 'bg-gray-900'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <header className="flex justify-between items-center px-6 lg:px-8 py-3 lg:py-4 bg-transparent rounded-full">
          <motion.h1 
            className="text-base lg:text-lg font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" aria-label="Freddie Kohn - Home">
              Freddie Kohn
            </Link>
          </motion.h1>
          <nav className="space-x-3 lg:space-x-4" role="menubar">
            <motion.div className="inline-block" role="none">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                role="menuitem"
              >
                <span>Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            <motion.div className="inline-block" role="none">
              <Link 
                href="/projects" 
                className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                role="menuitem"
              >
                <span>Projects</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            <motion.div className="inline-block" role="none">
              <Link 
                href="/skills" 
                className="text-gray-300 hover:text-white transition-colors duration-300 relative group text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                role="menuitem"
              >
                <span>Skills</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 text-black px-3 lg:px-4 py-2 rounded hover:bg-yellow-400 transition-all duration-300 hover:shadow-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={onContactClick ? onContactClick : () => setShowContact(true)}
              role="menuitem"
            >
              Contact
            </motion.button>
          </nav>
        </header>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`
          fixed 
          top-4
          right-4
          left-4
          z-50 
          bg-gray-900
          text-white 
          shadow-lg
          rounded-2xl
          transition-all duration-300 ease-in-out
          md:hidden
          ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-xl' : 'bg-gray-900'}
        `}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <header className="flex justify-between items-center px-4 py-3 bg-transparent rounded-2xl">
          <motion.h1 
            className="text-sm font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" aria-label="Freddie Kohn - Home">
              Freddie Kohn
            </Link>
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </header>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gray-700 bg-gray-800/50 rounded-b-2xl overflow-hidden"
              role="menu"
            >
              <div className="py-4 px-4 space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  role="none"
                >
                  <Link 
                    href="/" 
                    className="block py-2 px-4 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={closeMobileMenu}
                    role="menuitem"
                  >
                    Home
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  role="none"
                >
                  <Link 
                    href="/projects" 
                    className="block py-2 px-4 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={closeMobileMenu}
                    role="menuitem"
                  >
                    Projects
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  role="none"
                >
                  <Link 
                    href="/skills" 
                    className="block py-2 px-4 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={closeMobileMenu}
                    role="menuitem"
                  >
                    Skills
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  role="none"
                >
                  <button
                    className="w-full text-left py-2 px-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={handleMobileContactClick}
                    role="menuitem"
                  >
                    Contact
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="relative w-full max-w-md mx-4 p-6 md:p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/80 shadow-2xl backdrop-blur-xl"
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
                className="text-2xl md:text-3xl font-extrabold mb-2 text-white text-center tracking-tight"
              >
                Let's Connect!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 mb-6 text-center text-sm md:text-base"
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
                  <svg className="w-4 md:w-5 h-4 md:h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6"/></svg>
                  <span className="font-semibold text-white text-sm md:text-base">Email:</span>
                  <a href="mailto:freddiej.kohn@gmail.com" className="text-yellow-400 hover:underline text-xs md:text-sm break-all transition-colors duration-200">freddiej.kohn@gmail.com</a>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3"
                >
                  <svg className="w-4 md:w-5 h-4 md:h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/></svg>
                  <span className="font-semibold text-white text-sm md:text-base">LinkedIn:</span>
                  <a href="https://www.linkedin.com/in/freddie-j-kohn/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm transition-colors duration-200">@freddie-j-kohn</a>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 md:mt-8 text-center"
              >
                <span className="inline-block bg-yellow-400/10 text-yellow-300 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium border border-yellow-400/30 shadow-sm tracking-wide">
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
