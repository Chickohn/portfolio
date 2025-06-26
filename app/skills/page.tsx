"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { scrollAnimationVariants, staggerContainer, hoverLiftVariants, hoverScaleVariants } from '../../lib/utils';

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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2 
          className="text-4xl font-bold mb-4 text-center"
          variants={scrollAnimationVariants}
        >
          Current technologies
        </motion.h2>
        <motion.p 
          className="mb-8 text-gray-300 max-w-2xl mx-auto text-center"
          variants={scrollAnimationVariants}
        >
          I'm proficient in a range of modern technologies that empower me to build highly functional solutions. These are some of my main technologies.
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            variants={scrollAnimationVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="flex items-center space-x-4 bg-gray-900 hover:bg-gray-800 transition-all duration-300 hover-lift">
              <CardHeader className="flex flex-row items-center space-x-4 p-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {tech.icon}
                </motion.div>
                <div>
                  <CardTitle className="text-lg text-white">{tech.name}</CardTitle>
                  <CardDescription>{tech.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Page;
