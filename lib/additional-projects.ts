import type { ProjectItem } from "@/types";

/**
 * Additional projects that are external or don't have detail pages.
 *
 * NOTE:
 * - These are displayed on `/projects`, but they do not map to `/projects/[slug]` detail routes.
 * - We keep them in a plain module (no Next/React imports) so they can be backed up and migrated.
 */
export const additionalProjects: ProjectItem[] = [
  {
    slug: "https://github.com/Chickohn/QUBO-Visualisation",
    title: "QUBO Visualisation",
    description:
      "Problem: Slow manual hardcoding of Hamiltonians | Role: Solo Developer | Stack: Python, PennyLane, JAXopt | Outcome: Automated hamiltonian generator and histogram visualisation of QUBO",
    tags: ["Python", "PennyLane", "JAXopt", "Quantum Computing"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "https://github.com/Chickohn/Trading-Bot",
    title: "Day Trading Bot (In Progress)",
    description:
      "Problem: Manual trading inefficiency | Role: Solo Developer | Stack: Python, Alpaca API | Outcome: Automated trading system",
    tags: ["Python", "Alpaca API", "Trading"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "beckohn-digital",
    title: "Beckohn Digital",
    description:
      "Problem: Need modern web presence | Role: Co-founder/Dev | Stack: React, Python | Outcome: Live startup platform",
    tags: ["React", "Python", "UI/UX"],
    category: "Web Development",
    external: true,
    link: "https://beckohn.com",
  },
  {
    slug: "https://github.com/Chickohn/Visual_Robot_Arm",
    title: "Dissertation Project - Visual Robot Arm",
    description:
      "Problem: Complex robotic learning | Role: Researcher | Stack: Python, RL, PandaGym | Outcome: Chemical synthesis automation",
    tags: ["Python", "Reinforcement Learning", "Robotics"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "https://github.com/PeterBeckDev/BeckohnSoftwarePlatform",
    title: "Beckohn Digital Software Platform",
    description:
      "Problem: Backend infrastructure | Role: Backend Lead | Stack: Node.js, Python | Outcome: Scalable platform foundation",
    tags: ["Node.js", "Python", "JavaScript"],
    category: "Software Development",
    external: true,
  },
  {
    slug: "https://github.com/Chickohn/Sports-Analysis",
    title: "Analysis Tool (Offline)",
    description:
      "Problem: Sports data insights | Role: Full-stack Dev | Stack: Web Analytics | Outcome: Performance visualization dashboard",
    tags: ["Web", "Analytics", "Data Visualization"],
    category: "Web Development",
    external: true,
  },
  {
    slug: "browns-road-garage-website",
    title: "Browns Road Garage Website",
    description:
      "Problem: Local business visibility | Role: Solo Developer | Stack: PHP, WordPress | Outcome: Live customer-facing site",
    tags: ["HTML/CSS", "PHP", "WordPress"],
    category: "Web Development",
    external: true,
    link: "https://www.brownsroadgarage.co.uk",
  },
  {
    slug: "gym-buddy",
    title: "Gym Buddy",
    description:
      "Problem: Fitness tracking complexity | Role: Full-stack | Stack: React, TypeScript, Node.js | Outcome: Personal workout app",
    tags: ["React", "TypeScript", "Node.js"],
    category: "Software Development",
    external: true,
    link: "https://github.com/Chickohn/GymBuddyApp/tree/main",
  },
];

