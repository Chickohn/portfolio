import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const technologies = [
  {
    name: "React",
    description: "JavaScript Library",
    icon: (
      <a>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" alt="React" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "Figma",
    description: "Design Tool",
    icon: (
       <a>
        <img src="https://s3-alpha.figma.com/hub/file/1481185752/fa4cd070-6a79-4e1b-b079-8b9b76408595-cover.png" alt="Figma" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "TypeScript",
    description: "JavaScript but better",
    icon: (
      <a>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Typescript.svg/1200px-Typescript.svg.png" alt="TypeScript" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "JavaScript",
    description: "Programming Language",
    icon: (
      <a>
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JavaScript" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "Python",
    description: "Programming Language",
    icon: (
      <a>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Python.svg/800px-Python.svg.png" alt="Python" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "GitHub",
    description: "Version Control",
    icon: (
      <a>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/250px-GitHub_Invertocat_Logo.svg.png" alt="GitHub" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "Jira",
    description: "Project Management",
    icon: (
      <a>
        <img src="https://play-lh.googleusercontent.com/_AZCbg39DTuk8k3DiPRASr9EwyW058pOfzvAu1DsfN9ygtbOlbuucmXaHJi5ooYbokQX" alt="Jira" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "Unity",
    description: "Game Engine",
    icon: (
      <a>
        <img src="https://avatars.githubusercontent.com/u/426196?s=200&v=4" alt="Unity" width="32" height="32" />
      </a>
    ),
  },
  {
    name: ".NET",
    description: "Framework",
    icon: (
      <a>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Microsoft_.NET_logo.svg/1200px-Microsoft_.NET_logo.svg.png" alt=".NET" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "WordPress",
    description: "CMS Platform",
    icon: (
      <a>
        <img src="https://s.w.org/style/images/about/WordPress-logotype-wmark.png" alt="WordPress" width="32" height="32" />
      </a>
    ),
  },
  {
    name: "HTML/CSS",
    description: "Web Basics",
    icon: (
      <a>
        <img src="https://www.citypng.com/public/uploads/preview/html5-css3-logos-icons-free-png-70175169477179641iwgig0db.png" alt="HTML/CSS" width="32" height="32" />
      </a>
    ),
  },
];

const Page = () => {
  return (
    <div className="bg-black text-white min-h-screen px-4 py-12">
      <h2 className="text-4xl font-bold mb-4 text-center">Current technologies</h2>
      <p className="mb-8 text-gray-300 max-w-2xl mx-auto text-center">
        I'm proficient in a range of modern technologies that empower me to build highly functional solutions. These are some of my main technologies.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {technologies.map((tech) => (
          <Card key={tech.name} className="flex items-center space-x-4 bg-gray-900 hover:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center space-x-4 p-4">
              <div>{tech.icon}</div>
              <div>
                <CardTitle className="text-lg text-white">{tech.name}</CardTitle>
                <CardDescription>{tech.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Page;
