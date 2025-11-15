"use client";
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowUpRight, Gamepad2, Code2 } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { scrollAnimationVariants, slideInLeftVariants, slideInRightVariants, staggerContainer, hoverLiftVariants, hoverScaleVariants } from '../../lib/utils'
import { projects } from '../../lib/projects'

// Type for project items displayed in the listing
interface ProjectItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  external: boolean;
  link?: string;
}

// Additional projects that are external or don't have detail pages
const additionalProjects: ProjectItem[] = [
  {
    slug: "https://github.com/Chickohn/QUBO-Visualisation",
    title: "QUBO Visualisation",
    description: "Problem: Slow manual hardcoding of Hamiltonians | Role: Solo Developer | Stack: Python, PennyLane, JAXopt | Outcome: Automated hamiltonian generator and histogram visualisation of QUBO",
    tags: ["Python", "PennyLane", "JAXopt", "Quantum Computing"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "https://github.com/Chickohn/Trading-Bot",
    title: "Day Trading Bot (In Progress)",
    description: "Problem: Manual trading inefficiency | Role: Solo Developer | Stack: Python, Alpaca API | Outcome: Automated trading system",
    tags: ["Python", "Alpaca API", "Trading"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "beckohn-digital",
    title: "Beckohn Digital",
    description: "Problem: Need modern web presence | Role: Co-founder/Dev | Stack: React, Python | Outcome: Live startup platform",
    tags: ["React", "Python", "UI/UX"],
    category: "Web Development",
    external: true,
    link: "https://beckohn.com"
  },
  {
    slug: "https://github.com/Chickohn/Visual_Robot_Arm",
    title: "Dissertation Project - Visual Robot Arm",
    description: "Problem: Complex robotic learning | Role: Researcher | Stack: Python, RL, PandaGym | Outcome: Chemical synthesis automation",
    tags: ["Python", "Reinforcement Learning", "Robotics"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "https://github.com/PeterBeckDev/BeckohnSoftwarePlatform",
    title: "Beckohn Digital Software Platform",
    description: "Problem: Backend infrastructure | Role: Backend Lead | Stack: Node.js, Python | Outcome: Scalable platform foundation",
    tags: ["Node.js", "Python", "JavaScript"],
    category: "Software Development",
    external: true
  },
  {
    slug: "https://github.com/Chickohn/Sports-Analysis",
    title: "Analysis Tool (Offline)",
    description: "Problem: Sports data insights | Role: Full-stack Dev | Stack: Web Analytics | Outcome: Performance visualization dashboard",
    tags: ["Web", "Analytics", "Data Visualization"],
    category: "Web Development",
    external: true
  },
  {
    slug: "browns-road-garage-website",
    title: "Browns Road Garage Website",
    description: "Problem: Local business visibility | Role: Solo Developer | Stack: PHP, WordPress | Outcome: Live customer-facing site",
    tags: ["HTML/CSS", "PHP", "WordPress"],
    category: "Web Development",
    external: true,
    link: "https://www.brownsrdgaragesurbiton.co.uk"
  },
  {
    slug: "gym-buddy",
    title: "Gym Buddy",
    description: "Problem: Fitness tracking complexity | Role: Full-stack | Stack: React, TypeScript, Node.js | Outcome: Personal workout app",
    tags: ["React", "TypeScript", "Node.js"],
    category: "Software Development",
    external: true,
    link: "https://github.com/Chickohn/GymBuddyApp/tree/main"
  }
];

// Combine projects from centralized data with additional external projects
const allProjects: ProjectItem[] = [
  ...projects.map(project => ({
    slug: project.id,
    title: project.title,
    description: project.description,
    tags: project.technologies,
    category: project.category,
    external: false
  })),
  ...additionalProjects
];

// Category configuration with display settings
const categoryConfig: Record<string, { title: string; description: string; icon: any }> = {
  "Software Development": {
    title: "Software Development",
    description: "Check out my software engineering projects",
    icon: Code2
  },
  "Web Development": {
    title: "Web Development",
    description: "Modern web applications and digital experiences",
    icon: Code2
  },
  "Video Games": {
    title: "Video Games", 
    description: "Explore my game development projects",
    icon: Gamepad2
  }
};

// Type for grouped project categories
interface ProjectCategory {
  category: string;
  title: string;
  description: string;
  icon: any;
  items: ProjectItem[];
}

// Dynamically group projects by category
function getGroupedProjects(): ProjectCategory[] {
  const grouped: Record<string, ProjectItem[]> = {};
  
  // Group projects by category
  allProjects.forEach(project => {
    if (!grouped[project.category]) {
      grouped[project.category] = [];
    }
    grouped[project.category].push(project);
  });
  
  // Convert to array format with category info, maintaining order
  const categoryOrder = ["Software Development", "Web Development", "Video Games"];
  const result: ProjectCategory[] = [];
  
  // Add categories in specified order
  categoryOrder.forEach(category => {
    if (grouped[category] && grouped[category].length > 0) {
      result.push({
        category,
        title: categoryConfig[category]?.title || category,
        description: categoryConfig[category]?.description || `Projects in ${category}`,
        icon: categoryConfig[category]?.icon || Code2,
        items: grouped[category]
      });
    }
  });
  
  // Add any remaining categories not in the specified order
  Object.keys(grouped).forEach(category => {
    if (!categoryOrder.includes(category) && grouped[category].length > 0) {
      result.push({
        category,
        title: categoryConfig[category]?.title || category,
        description: categoryConfig[category]?.description || `Projects in ${category}`,
        icon: categoryConfig[category]?.icon || Code2,
        items: grouped[category]
      });
    }
  });
  
  return result;
}

export default function Projects() {
  // Detect mobile width on client
  const [isMobile, setIsMobile] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const projectsRef = useRef(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      
      // Check if projects section is already in view on mount
      const checkInView = () => {
        if (projectsRef.current) {
          const rect = (projectsRef.current as HTMLElement).getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // If element is in viewport (with some margin), animate immediately
          if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
            setShouldAnimate(true);
          }
        }
      };
      
      // Check immediately and after a short delay to catch any layout shifts
      checkInView();
      const timeout = setTimeout(checkInView, 100);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Use a default amount that works for both, will be recalculated on mount
  const viewportAmount = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.05 : 0.3;
  const isInView = useInView(projectsRef, { once: true, amount: viewportAmount, margin: "-50px" });
  
  // Combine both checks - animate if in view OR if should animate from mount check
  const animateNow = isInView || shouldAnimate;

  return (
    <div className="min-h-screen">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/70 -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="text-5xl font-bold text-white text-center mb-4"
            variants={scrollAnimationVariants}
          >
            My Projects
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-center mb-12 max-w-2xl mx-auto"
            variants={scrollAnimationVariants}
          >
            A collection of my work in software engineering and game development
          </motion.p>
        </motion.div>

        <motion.div 
          ref={projectsRef}
          className="space-y-16"
          initial="hidden"
          animate={animateNow ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Categories stacked vertically */}
          {getGroupedProjects().map((category: ProjectCategory, idx: number) => (
            <motion.div
              key={category.category}
              className="space-y-6"
              variants={scrollAnimationVariants}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6"
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <category.icon className="w-8 h-8 text-blue-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">{category.title}</h2>
              </motion.div>
              <motion.p 
                className="text-gray-300 mb-6"
                variants={scrollAnimationVariants}
              >
                {category.description}
              </motion.p>
              
              {/* Projects grid for this category */}
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
              >
                {category.items.map((project: ProjectItem, projectIndex: number) => (
                  <motion.div
                    key={project.slug}
                    variants={scrollAnimationVariants}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-white">
                              {project.title}
                            </CardTitle>
                            {/* Structured description */}
                            <ul className="text-gray-300 text-sm mt-2 space-y-1">
                              {project.description.split('|').map((segment) => {
                                const [label, ...rest] = segment.trim().split(':');
                                const value = rest.join(':').trim();
                                return (
                                  <li key={label} className="flex gap-1">
                                    <span className="font-semibold text-gray-100">{label}:</span>
                                    <span>{value}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 45 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {/* Render link based on project type */}
                            {project.external && project.link ? (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                              >
                                <ArrowUpRight className="w-6 h-6" />
                              </a>
                            ) : project.external && project.slug.startsWith('http') ? (
                              <a 
                                href={project.slug} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                              >
                                <ArrowUpRight className="w-6 h-6" />
                              </a>
                            ) : (
                              <Link 
                                href={`/projects/${project.slug}`}
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                              >
                                <ArrowUpRight className="w-6 h-6" />
                              </Link>
                            )}
                          </motion.div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="flex flex-wrap gap-2"
                          variants={staggerContainer}
                        >
                          {project.tags.map((tag: string, tagIndex: number) => (
                            <motion.span 
                              key={tag}
                              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                              variants={scrollAnimationVariants}
                              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                              transition={{ duration: 0.2 }}
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

