import { notFound } from 'next/navigation'
import Image from 'next/image'

type AsteroidsProject = {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  download: { src: string; filename: string; description: string };
  details: string;
};

type SwishMasterProject = {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  sections: (
    | { type: 'text'; content: string }
    | { type: 'image'; src: string; alt?: string; caption?: string }
    | { type: 'video'; src: string; alt?: string; caption?: string }
    | { type: 'file'; src: string; filename: string; description: string }
  )[];
};

const projects: { [key: string]: AsteroidsProject | SwishMasterProject } = {
  "3d-asteroids": {
    title: "3D Asteroids",
    description: "A modern take on the classic Asteroids game.",
    category: "Video Games",
    technologies: ["Unity", "C#", "3D Modeling"],
    download: {
      src: "/asteroids.zip",
      filename: "3D Asteroids",
      description: "Download Game",
    },
    details: `As part of my exploration into game development, I developed a 3D third-person shooter inspired by the classic arcade game "Asteroids" using Unity. The game is set within our solar system, with the player navigating a spaceship to defend Earth and other planets from an onslaught of meteors. The first level begins with the player in orbit around Earth, tasked with saving the planet from an approaching meteor shower. Upon successful defense, the player advances to subsequent levels, exploring other celestial bodies like Mars.\n\nIn addition to asteroids, I introduced dynamic enemy spaceships. These AI-driven adversaries initially patrol the orbit of planets, targeting the player upon detection. This creates a more challenging and engaging gameplay experience.\n\nTo manage the complexity of enemy behavior, I implemented a Finite State Machine (FSM) for AI decision-making. FSMs are a proven method in game development, offering simplicity and efficiency while allowing for robust control over state transitions. In this system, the enemy AI can only occupy one state at a time, such as patrolling or attacking, and transitions are triggered by specific in-game events, such as spotting the player or taking damage.\n\nBy leveraging the power of Unity and employing FSM-driven AI, I was able to create a seamless, immersive gameplay experience that balances strategic challenges with real-time action.`
  },
  "swish-master": {
    title: "Swish Master",
    description: "A basketball free throwing game developed using Unity",
    category: "Video Games",
    technologies: ["Unity", "C#", "3D Modeling"],
    sections: [
      {
        type: "text",
        content: "This project was coded in C# and designed using blender to create the models you can see in the video below.",
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
        description: "Download Game",
      },
    ],
  }
}

function isAsteroidsProject(project: AsteroidsProject | SwishMasterProject): project is AsteroidsProject {
  return (project as AsteroidsProject).details !== undefined;
}

export default async function Project({ params }: { params: { slug: string } }) {
  const project = projects[params.slug as keyof typeof projects]

  if (!project) {
    notFound()
  }

  return (
    <div className="p-0">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/90 -z-10" />

      {/* Content */}
      <div className="flex flex-col pt-16 items-center justify-center text-center text-white px-4 min-h-screen">
        <div className="w-full max-w-2xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-8 mx-auto animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-2 text-white tracking-tight">{project.title}</h1>
          <p className="text-lg text-yellow-400 mb-6 font-medium">{project.description}</p>
          {isAsteroidsProject(project) ? (
            <>
              {project.details.split('\n').map((para: string, idx: number) => (
                <p key={idx} className="mb-4 text-gray-200 text-base text-left last:mb-0">{para}</p>
              ))}
              {project.download && (
                <div className="mt-8 flex justify-center">
                  <a 
                    href={project.download.src} 
                    download={project.download.filename} 
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold shadow-lg transition-colors text-lg"
                  >
                    {project.download.description}
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              {('sections' in project) && project.sections.map((section, index) => {
                switch (section.type) {
                  case "text":
                    return (
                      <p key={index} className="mb-4 text-gray-200 text-base text-left last:mb-0">{section.content}</p>
                    )
                  case "image":
                    return (
                      <div key={index} className="mb-4">
                        <Image 
                          src={section.src || "/placeholder.svg"} 
                          alt={section.alt || "Image"}
                          width={800} 
                          height={450} 
                          className="rounded-lg mx-auto"
                        />
                        <p className="text-sm mt-2 text-gray-400">{section.caption || ""}</p>
                      </div>
                    )
                  case "video":
                    return (
                      <div key={index} className="mb-4">
                        <video controls className="rounded-lg mx-auto w-full max-w-xl">
                          <source src={section.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <p className="text-sm mt-2 text-gray-400">{section.caption || ""}</p>
                      </div>
                    )
                  case "file":
                    return (
                      <div key={index} className="mt-8 flex justify-center">
                        <a 
                          href={section.src} 
                          download={section.filename} 
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold shadow-lg transition-colors text-lg"
                        >
                          {section.description}
                        </a>
                      </div>
                    )
                  default:
                    return null
                }
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
