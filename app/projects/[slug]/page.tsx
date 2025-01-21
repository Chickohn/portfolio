import { notFound } from 'next/navigation'
import Image from 'next/image'

const projects = {
  "3d-asteroids": {
    title: "3D Asteroids",
    description: "A modern take on the classic Asteroids game.",
    category: "Video Games",
    technologies: ["Unity", "C#", "3D Modeling"],
    sections: [
      {
        type: "image",
        src: "/random.jpeg",
        alt: "Gameplay screenshot of 3D Asteroids",
        caption: "mee maw"
      },
      {
        type: "text",
        content: "As part of my exploration into game development, I developed a 3D third-person shooter inspired by the classic arcade game 'Asteroids' using Unity. The game is set within our solar system, with the player navigating a spaceship to defend Earth and other planets from an onslaught of meteors. The first level begins with the player in orbit around Earth, tasked with saving the planet from an approaching meteor shower. Upon successful defense, the player advances to subsequent levels, exploring other celestial bodies like Mars."
      },
      {
        type: "text",
        content: "This project was built using Unity and C#. It features 3D graphics, realistic physics, and online leaderboards.",
      },
      {
        type: "file",
        src: "/asteroids.zip",
        filename: "3D Asteroids",
        description: "Download Game",
      },
    ],
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
  },
  "gym-buddy": {
    title: "Gym Buddy",
    description: "A web application that helps users track their workouts...",
    category: "Software",
    technologies: ["Unity", "C#", "3D Modeling"],
    sections: [
      {
        type: "image",
        src: "/random.jpeg",
        alt: "Gameplay screenshot of 3D Asteroids",
        caption: "mee maw"
      },
      {
        type: "text",
        content: "This project was built using React, Node.js, MongoDB. It features 3D graphics, realistic physics, and online leaderboards.",
      },
      {
        type: "video",
        src: "/asteroids-trailer.mp4",
        alt: "Gameplay trailer",
        caption: "mee maw"
      },
      {
        type: "file",
        src: "/3d-asteroids-docs.pdf",
        filename: "3D Asteroids",
        description: "Download Documentation",
      },
    ],
  },
  "automated-fingerprint-identification-system": {
    title: "Automated Fingerprint Identification System",
    description: "A machine learning-based system that can identify and match fingerprints...",
    category: "Software",
    technologies: ["Unity", "C#", "3D Modeling"],
    sections: [
      {
        type: "image",
        src: "/random.jpeg",
        alt: "Gameplay screenshot of 3D Asteroids",
        caption: "mee maw"
      },
      {
        type: "text",
        content: "This project was built using Python, TensorFlow and Computer Vision. It features 3D graphics, realistic physics, and online leaderboards.",
      },
      {
        type: "video",
        src: "/asteroids-trailer.mp4",
        alt: "Gameplay trailer",
        caption: "mee maw"
      },
      {
        type: "file",
        src: "/3d-asteroids-docs.pdf",
        filename: "3D Asteroids",
        description: "Download Documentation",
      },
    ],
  }
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

      {/* Content */}
      <div className="flex flex-col pt-12 items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-xl mb-4">{project.description}</p>

        {/* Render sections */}
        {project.sections.map((section, index) => {
          switch (section.type) {
            case "text":
              return (
                <p key={index} className="mb-4 text-lg">{section.content}</p>
              )
            case "image":
              return (
                <div key={index} className="mb-4">
                  <Image 
                    src={section.src || "/placeholder.svg"} 
                    alt={section.alt || "Image"}
                    width={800} 
                    height={450} 
                    className="rounded-lg"
                  />
                  <p className="text-sm mt-2">{section.caption || ""}</p>
                </div>
              )
            case "video":
              return (
                <div key={index} className="mb-4">
                  <video controls className="rounded-lg">
                    <source src={section.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-sm mt-2">{section.caption || ""}</p>
                </div>
              )
            case "file":
              return (
                <div key={index} className="mb-4">
                  <a 
                    href={section.src} 
                    download={section.filename} 
                    className="text-white-500 p-4 hover:underline bg-indigo-500 rounded-full"
                  >
                    {section.description}
                  </a>
                </div>
              )
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
