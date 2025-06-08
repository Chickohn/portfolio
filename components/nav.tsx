import Link from 'next/link'

export default function Nav() {
  return (
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
          <Link href="/test" className="text-gray-300 hover:text-white">Skills</Link>
          <Link href="/about" className="text-gray-300 hover:text-white">About Me</Link>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded">Contact</button>
        </nav>
      </header>
      {/* Container to limit and center content, plus spacing
      <div className="mx-auto py-4 px-4 flex items-center justify-between">
        <Link href="/" className="text-xl pl-4 font-semibold">
          Freddie Kohn
        </Link>
        <ul className="flex space-x-8">
          <li>
            <Link href="/test" className="hover:text-gray-200 transition-colors">
              Test
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:text-gray-200 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/projects" className="hover:text-gray-200 transition-colors pr-8">
              Projects
            </Link>
          </li>
        </ul>
      </div> */}
    </nav>
  )
}
