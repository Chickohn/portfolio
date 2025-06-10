"use client";
import Link from 'next/link'
import React, { useState } from 'react'

export default function Nav() {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <nav
        className="
          fixed 
          top-8
          right-20
          left-20
          z-50 
          bg-gray-900
          text-white 
          shadow-lg
          rounded-full
        "
      >
        <header className="flex justify-between items-center px-8 py-4 bg-gray-900 rounded-full">
          <h1 className="text-lg font-bold">Freddie Kohn</h1>
          <nav className="space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link href="/projects" className="text-gray-300 hover:text-white">Projects</Link>
            <Link href="/skills" className="text-gray-300 hover:text-white">Skills</Link>
            <button
              className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
              onClick={() => setShowContact(true)}
            >
              Contact
            </button>
          </nav>
        </header>
      </nav>
      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/80 shadow-2xl backdrop-blur-xl animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 text-2xl font-bold focus:outline-none"
              onClick={() => setShowContact(false)}
              aria-label="Close contact panel"
            >
              ×
            </button>
            <h2 className="text-3xl font-extrabold mb-2 text-white text-center tracking-tight">Let's Connect!</h2>
            <p className="text-gray-300 mb-6 text-center text-base">I'd love to hear from you. Feel free to reach out or connect with me on LinkedIn.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6"/></svg>
                <span className="font-semibold text-white">Email:</span>
                <a href="mailto:freddiej.kohn@gmail.com" className="text-yellow-400 hover:underline break-all">freddiej.kohn@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z"/></svg>
                <span className="font-semibold text-white">LinkedIn:</span>
                <a href="https://www.linkedin.com/in/freddie-j-kohn/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@freddie-j-kohn</a>
              </div>
            </div>
            <div className="mt-8 text-center">
              <span className="inline-block bg-yellow-400/10 text-yellow-300 px-4 py-2 rounded-full font-medium border border-yellow-400/30 shadow-sm tracking-wide">Open to new opportunities and collaborations!</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
