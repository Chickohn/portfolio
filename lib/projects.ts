// Project type definitions
export interface ProjectSection {
  type: 'text' | 'image' | 'video' | 'file';
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
  filename?: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  sections: ProjectSection[];
}

// Project data
export const projects: Project[] = [
  {
    id: "3d-asteroids",
    title: "3D Asteroids",
    description: "A modern take on the classic Asteroids game.",
    category: "Video Games",
    technologies: ["Unity", "C#", "3D Modeling"],
    sections: [
      {
        type: "text",
        content: "As part of my exploration into game development, I developed a 3D third-person shooter inspired by the classic arcade game \"Asteroids\" using Unity. The game is set within our solar system, with the player navigating a spaceship to defend Earth and other planets from an onslaught of meteors. The first level begins with the player in orbit around Earth, tasked with saving the planet from an approaching meteor shower. Upon successful defense, the player advances to subsequent levels, exploring other celestial bodies like Mars."
      },
      {
        type: "text",
        content: "In addition to asteroids, I introduced dynamic enemy spaceships. These AI-driven adversaries initially patrol the orbit of planets, targeting the player upon detection. This creates a more challenging and engaging gameplay experience."
      },
      {
        type: "text",
        content: "To manage the complexity of enemy behavior, I implemented a Finite State Machine (FSM) for AI decision-making. FSMs are a proven method in game development, offering simplicity and efficiency while allowing for robust control over state transitions. In this system, the enemy AI can only occupy one state at a time, such as patrolling or attacking, and transitions are triggered by specific in-game events, such as spotting the player or taking damage."
      },
      {
        type: "text",
        content: "By leveraging the power of Unity and employing FSM-driven AI, I was able to create a seamless, immersive gameplay experience that balances strategic challenges with real-time action."
      },
      {
        type: "file",
        src: "/asteroids.zip",
        filename: "3D Asteroids",
        description: "Download Game"
      }
    ]
  },
  {
    id: "swish-master",
    title: "Swish Master",
    description: "A basketball free throwing game developed using Unity",
    category: "Video Games",
    technologies: ["Unity", "C#", "3D Modeling"],
    sections: [
      {
        type: "text",
        content: "This project was coded in C# and designed using blender to create the models you can see in the video below."
      },
      {
        type: "video",
        src: "/swish-master.mp4",
        alt: "Gameplay trailer",
        caption: "Video starts in the menu where you can change the round lengths and toggle on/off powerups."
      },
      {
        type: "file",
        src: "/swish-master.zip",
        filename: "Swish-Master",
        description: "Download Game"
      }
    ]
  },
  {
    id: "route-optimisation",
    title: "Route Optimisation",
    description: "Advanced algorithm for optimising delivery routes",
    category: "Software Development",
    technologies: ["Python", "Genetic Algorithms", "Google Maps API"],
    sections: [
      {
        type: "text",
        content: "For a small personal project, I wanted to create an algorithm that would take a list of locations and return the most efficient route to visit them all. I decided to use a genetic algorithm to solve this problem."
      },
      {
        type: "text",
        content: "The algorithm works by creating a population of routes, and then selecting the fittest routes to create a new population. This process is repeated until the algorithm converges on a solution."
      },
      {
        type: "text",
        content: "View the code on my GitHub: https://github.com/Chickohn/Route-Optimisation or download the zip file below."
      },
      {
        type: "file",
        src: "/route-optimiser.zip",
        filename: "Route-Optimiser",
        description: "Download Zip"
      }
    ]
  }
];

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(project => project.id === id);
}

// Helper function to get all project IDs (useful for static generation)
export function getAllProjectIds(): string[] {
  return projects.map(project => project.id);
} 