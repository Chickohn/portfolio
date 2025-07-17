"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { scrollAnimationVariants, staggerContainer, hoverLiftVariants } from '../../lib/utils';
import { Code2, Gamepad2, Globe, Database, Cpu, Palette } from 'lucide-react';

// T-shaped skills model: Deep expertise + Broad knowledge
const skillCategories = [
  {
    title: "Core Expertise (T-Depth)",
    description: "Deep specialization areas",
    color: "from-blue-600 to-blue-400",
    skills: [
      { name: "Python", level: 95, icon: "🐍", description: "Primary language, 4+ years" },
      { name: "Unity & C#", level: 90, icon: "🎮", description: "Game development, 3+ years" },
      { name: "React", level: 85, icon: "⚛️", description: "Modern web development" },
    ]
  },
  {
    title: "Supporting Technologies (T-Width)",
    description: "Broad foundational knowledge",
    color: "from-green-600 to-green-400",
    skills: [
      { name: "JavaScript", level: 75, icon: "📜", description: "Frontend & Node.js" },
      { name: "TypeScript", level: 70, icon: "🔷", description: "Type-safe development" },
      { name: "Swift", level: 60, icon: "🍎", description: "iOS development" },
      { name: ".NET", level: 65, icon: "🔧", description: "Enterprise applications" },
      { name: "PHP", level: 55, icon: "🐘", description: "Backend development" },
    ]
  },
  {
    title: "Tools & Frameworks",
    description: "Development ecosystem",
    color: "from-purple-600 to-purple-400",
    skills: [
      { name: "Git", level: 85, icon: "📚", description: "Version control" },
      { name: "Node.js", level: 75, icon: "🟢", description: "Backend runtime" },
      { name: "Tailwind CSS", level: 80, icon: "🎨", description: "Utility-first CSS" },
      { name: "Figma", level: 70, icon: "✏️", description: "UI/UX design" },
      { name: "Blender", level: 45, icon: "🎲", description: "3D modeling" },
    ]
  },
  {
    title: "Concepts & Methodologies",
    description: "Computer science fundamentals",
    color: "from-yellow-600 to-yellow-400",
    skills: [
      { name: "Algorithms & Data Structures", level: 85, icon: "🧮", description: "CS fundamentals" },
      { name: "Machine Learning", level: 70, icon: "🤖", description: "AI/ML concepts" },
      { name: "Game AI", level: 80, icon: "🎯", description: "FSM, pathfinding" },
      { name: "RESTful APIs", level: 75, icon: "🔗", description: "Backend architecture" },
      { name: "Database Design", level: 65, icon: "🗄️", description: "SQL & NoSQL" },
    ]
  }
];

const SkillBar = ({ skill, index }: { skill: any, index: number }) => {
  // Convert percentage to experience level
  const getExperienceLevel = (level: number) => {
    if (level >= 90) return { text: "Expert", years: "4+ yrs" };
    if (level >= 80) return { text: "Advanced", years: "3+ yrs" };
    if (level >= 70) return { text: "Intermediate", years: "2+ yrs" };
    if (level >= 60) return { text: "Beginner+", years: "1+ yrs" };
    return { text: "Learning", years: "<1 yr" };
  };

  const experience = getExperienceLevel(skill.level);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={skill.name}>{skill.icon}</span>
          <h4 className="font-semibold text-white text-sm md:text-base">{skill.name}</h4>
        </div>
        <span className="text-gray-300 text-sm font-medium">
          {experience.text}
          <span className="sr-only"> ({experience.years} experience)</span>
        </span>
      </div>
      <div 
        className="w-full bg-gray-700 rounded-full h-2 mb-1 overflow-hidden"
        role="progressbar"
        aria-label={`${skill.name} proficiency`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={skill.level}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-current to-current rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: index * 0.1 }}
        />
      </div>
      <p className="text-gray-400 text-xs">{skill.description}</p>
    </motion.div>
  );
};

export default function Skills() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900/80 to-gray-950/90 -z-10" />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            variants={scrollAnimationVariants}
          >
            Technical Skills
          </motion.h1>
          <motion.p 
            className="text-gray-200 text-lg md:text-xl max-w-3xl mx-auto mb-8"
            variants={scrollAnimationVariants}
          >
            T-shaped expertise: Deep specialization in core technologies with broad knowledge across the development ecosystem
          </motion.p>
          
          {/* Quick overview badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-12"
            variants={staggerContainer}
          >
            {["Python", "Unity", "React", "C#", "JavaScript", "TypeScript"].map((tech, index) => (
              <motion.span
                key={tech}
                variants={scrollAnimationVariants}
                className="px-4 py-2 bg-blue-600/30 text-blue-100 rounded-full text-sm border border-blue-400/50 hover:bg-blue-600/40 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Skills Categories */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={scrollAnimationVariants}
              className="group"
            >
              <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-600/50 hover:bg-gray-800/90 transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className={`w-full h-1 bg-gradient-to-r ${category.color} rounded-full mb-4`} />
                  <CardTitle className="text-xl md:text-2xl text-white mb-2">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm md:text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <SkillBar key={skill.name} skill={skill} index={skillIndex} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Learning Journey */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mt-16 text-center"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            variants={scrollAnimationVariants}
          >
            Learning Journey
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
          >
            <motion.div
              variants={scrollAnimationVariants}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50"
            >
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Education</h3>
              <p className="text-gray-300 text-sm">
                Class I Computer Science degree focusing on software engineering and algorithm design
              </p>
            </motion.div>
            
            <motion.div
              variants={scrollAnimationVariants}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50"
            >
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional</h3>
              <p className="text-gray-300 text-sm">
                Co-founder at Beckohn Digital, building modern web applications and digital experiences
              </p>
            </motion.div>
            
            <motion.div
              variants={scrollAnimationVariants}
              className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50"
            >
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Projects</h3>
              <p className="text-gray-300 text-sm">
                Game development, AI research, and full-stack web applications across various domains
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
