import React from 'react';

const projects = [
  {
    category: "Personal Website",
    title: "Implementing algorithms in real-world applications",
    featured: true,
  },
  {
    category: "Tech App",
    title: "Database management system",
  },
  {
    category: "Mobile App",
    title: "Creating user-friendly interfaces",
  },
  {
    category: "Web Development",
    title: "E-commerce platform design",
  },
];

const Page = () => {
  return (
    <div className="bg-black text-white min-h-screen">
    {/* Projects Section */}
    <section id="projects" className="px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold">{project.category}</h3>
                <p className="text-sm text-gray-400">{project.title}</p>
                {project.featured && (
                <span className="bg-yellow-500 text-black px-2 py-1 text-xs rounded-full inline-block mt-2">
                    Featured
                </span>
                )}
                <button className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
                View details
                </button>
            </div>
            </div>
        ))}
        </div>
    </section>

    {/* Contact Section */}
    <footer className="bg-gray-900 px-8 py-12">
        <h3 className="text-2xl font-bold mb-4">Let&apos;s build something amazing</h3>
        <form>
        <input
            type="text"
            placeholder="Enter your message"
            className="w-full bg-gray-800 text-white p-4 rounded mb-4"
        />
        <button className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400">
            Submit
        </button>
        </form>
        <div className="flex justify-between text-sm text-gray-400 mt-8">
        <div>
            <p>Email: hello@codeshowcase.com</p>
            <p>Phone: 111 222 333 444</p>
            <p>Address: Main street 5</p>
        </div>
        <div className="flex space-x-4">
            <a href="#" className="hover:text-white">View</a>
            <a href="#" className="hover:text-white">View</a>
            <a href="#" className="hover:text-white">View</a>
        </div>
        </div>
    </footer>
    </div>
  );
};

export default Page;
