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
        bg-gradient-to-r 
        from-indigo-600 
        to-purple-600 
        text-white 
        shadow-lg
        rounded-full
      "
    >
      {/* Container to limit and center content, plus spacing */}
      <div className="mx-auto py-4 px-4 flex items-center justify-between">
        <Link href="/" className="text-xl pl-4 font-semibold">
          Freddie Kohn
        </Link>
        <ul className="flex space-x-8">
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
      </div>
    </nav>
  )
}
