import { useState } from 'react';
import { Github, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import ProjectModal from './ProjectModal';

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projects = [
    {
      title: "RecipeMe – AI-Powered Recipe Generation App",
      description: "An AI-powered Flutter mobile app that generates personalized recipes from fridge photos or manual ingredient entry using OpenAI's Vision and GPT models.",
      longDescription: "RecipeMe is an intelligent mobile app built with Flutter that generates personalized recipes using AI. Users can take a photo of their fridge or manually enter ingredients, and RecipeMe analyzes the items using OpenAI's Vision and GPT models to create 3–5 tailored recipe options. The app adapts suggestions to each user's cooking skill level, favorite cuisines, allergies, and available equipment. This project highlights skills in Flutter development, AI integration, backend engineering with Supabase, and end-to-end app architecture.",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpcGUlMjBhcHB8ZW58MXx8fHwxNzU1MzA5OTE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      screenshots: [
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpcGUlMjBhcHB8ZW58MXx8fHwxNzU1MzA5OTE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcmVjaXBlfGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      technologies: ["Flutter", "Supabase (Auth, PostgreSQL DB, Storage)", "OpenAI Vision + GPT-4o-mini", "Dart", "Google Sign-In", "Image Picker / REST APIs"],
      category: "Mobile Development",
      status: "completed" as const,
      duration: "4 months",
      teamSize: 5,
      features: [
        "AI-powered ingredient detection from fridge/pantry photos",
        "Manual ingredient entry with flexible quantity parsing",
        "Personalized recipe generation based on user profile",
        "Saved recipe history with full details",
        "Google Sign-In + email authentication",
        "Offline support for viewing stored recipes",
        "Modern, polished UI with smooth navigation"
      ],
      challenges: [
        "Building robust ingredient extraction from mixed-quality images",
        "Prompt engineering for consistent recipe output",
        "Implementing secure Supabase RLS rules for user data",
        "Coordinating image upload → AI analysis → recipe generation flow",
        "Managing multi-step onboarding and personalized user profiles"
      ],
      github: "https://github.com/ahmedamrou1/RecipeMe"
    },
    {
      title: "Python-Based Keylogger",
      description: "A security testing tool developed using Python for authorized environments with encryption and stealth capabilities.",
      longDescription: "This sophisticated security testing tool was developed using Python to log keystrokes in authorized testing environments. The application implements advanced encryption techniques to secure captured data and features a stealth mode for realistic simulation of security threats. This project demonstrates expertise in cybersecurity, Python programming, and ethical hacking practices.",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwc2VjdXJpdHklMjB0ZXN0aW5nfGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      screenshots: [
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwc2VjdXJpdHklMjB0ZXN0aW5nfGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXRob24lMjBwcm9ncmFtbWluZyUyMGNvZGV8ZW58MXx8fHwxNzU1MjYzMzQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      technologies: ["Python", "Cryptography", "Windows API", "Stealth Techniques", "File Handling"],
      category: "Security",
      status: "completed" as const,
      duration: "2 months",
      teamSize: 1,
      features: [
        "Secure keystroke logging with encryption",
        "Stealth mode for undetected operation",
        "Authorized environment testing only",
        "Data encryption and secure storage",
        "Comprehensive logging capabilities"
      ],
      challenges: [
        "Implementing effective stealth techniques",
        "Ensuring secure data encryption",
        "Maintaining ethical use guidelines"
      ],
      github: "https://github.com/justprnv/Python-Based-Keylogger-and-Detector"
    },
    {
      title: "Keylogger Detector",
      description: "A Python application that scans for suspicious processes and file changes to detect potential keylogging activity.",
      longDescription: "This defensive cybersecurity tool was created to protect users from malicious keyloggers. Built with Python, it continuously monitors system processes and file changes to identify suspicious keylogging activity. The application provides real-time alerts and detailed reports to help users maintain system security and privacy.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMG1vbml0b3JpbmclMjBzeXN0ZW18ZW58MXx8fHwxNzU1MzA5OTE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      screenshots: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMG1vbml0b3JpbmclMjBzeXN0ZW18ZW58MXx8fHwxNzU1MzA5OTE3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      technologies: ["Python", "System Monitoring", "Process Analysis", "File System Monitoring", "Alert Systems"],
      category: "Security",
      status: "completed" as const,
      duration: "1.5 months",
      teamSize: 1,
      features: [
        "Real-time process monitoring",
        "Suspicious activity detection",
        "File system change tracking",
        "Instant alert notifications",
        "Detailed security reports"
      ],
      challenges: [
        "Minimizing false positive detections",
        "Optimizing system resource usage",
        "Creating accurate threat detection algorithms"
      ],
      github: "https://github.com/justprnv/Python-Based-Keylogger-and-Detector"
    },
    {
      title: "Portfolio Website",
      description: "A personal portfolio site designed and deployed using HTML, CSS, and JavaScript to showcase projects and skills.",
      longDescription: "This comprehensive portfolio website showcases my professional work and technical skills. Built from scratch using modern web technologies including HTML5, CSS3, and JavaScript, it features responsive design, smooth animations, and an intuitive user interface. The site demonstrates proficiency in front-end development and web design principles.",
      image: "https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0Zm9saW8lMjB3ZWJzaXRlJTIwZGVzaWdufGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      screenshots: [
        "https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0Zm9saW8lMjB3ZWJzaXRlJTIwZGVzaWdufGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGRlc2lnbnxlbnwxfHx8fDE3NTUzMDk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      technologies: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Web Deployment"],
      category: "Web Development",
      status: "completed" as const,
      duration: "3 weeks",
      teamSize: 1,
      features: [
        "Responsive design for all devices",
        "Smooth scrolling navigation",
        "Interactive project showcases",
        "Professional styling and layout",
        "Optimized performance and loading"
      ],
      challenges: [
        "Creating cross-browser compatibility",
        "Implementing smooth animations",
        "Optimizing for mobile devices"
      ],
      github: "https://github.com/justprnv/portfolio-website"
    },
    {
      title: "Student Management Application",
      description: "A Python + SQLite application for grading and student record management with a custom Windows installer.",
      longDescription: "This comprehensive student management system was built using Python and SQLite to handle grading and student record management efficiently. The application features a user-friendly interface for teachers and administrators, complete database management, and comes with a custom Windows installer that automatically adds desktop shortcuts for easy access.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbWFuYWdlbWVudCUyMHN5c3RlbXxlbnwxfHx8fDE3NTUzMDk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      screenshots: [
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbWFuYWdlbWVudCUyMHN5c3RlbXxlbnwxfHx8fDE3NTUzMDk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      technologies: ["Python", "SQLite", "Tkinter", "Windows Installer", "Database Design"],
      category: "Desktop Application",
      status: "completed" as const,
      duration: "2 months",
      teamSize: 1,
      features: [
        "Complete student record management",
        "Grading system with analytics",
        "SQLite database integration",
        "Custom Windows installer",
        "Desktop shortcut automation"
      ],
      challenges: [
        "Designing efficient database schema",
        "Creating user-friendly interface",
        "Developing custom installer script"
      ],
      github: "https://github.com/justprnv/student-management"
    },
    {
      title: "Blogging Website",
      description: "A Flask-based web application with user authentication, post creation, hashtag support, and real-time updates.",
      longDescription: "This full-featured blogging platform was developed using Flask framework, providing a complete content management system for bloggers. The application includes secure user authentication, rich text post creation, hashtag categorization, and real-time updates. It demonstrates proficiency in full-stack web development and modern web application architecture.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd2Vic2l0ZSUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      screenshots: [
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9nJTIwd2Vic2l0ZSUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc1NTMwOTkxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGRlc2lnbnxlbnwxfHx8fDE3NTUzMDk5MTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
      ],
      technologies: ["Flask", "Python", "SQLAlchemy", "Jinja2", "HTML/CSS", "JavaScript"],
      category: "Web Development",
      status: "completed" as const,
      duration: "2.5 months",
      teamSize: 1,
      features: [
        "Secure user authentication system",
        "Rich text post creation and editing",
        "Hashtag categorization and search",
        "Real-time content updates",
        "Responsive design and user dashboard"
      ],
      challenges: [
        "Implementing real-time updates efficiently",
        "Designing scalable database relationships",
        "Creating intuitive user experience"
      ],
      github: "https://github.com/justprnv/Post50"
    }
  ];

  const openModal = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <section id="projects" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Projects</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here are some of the projects I've worked on, showcasing my skills in various technologies and domains. Click on any project to learn more about the technical details and challenges.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className="bg-card rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer card-glow hover-aura"
              onClick={() => openModal(project)}
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white">
                    {project.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-center">
                    <Plus size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Click to learn more</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl mb-3">{project.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover-aura"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover-aura">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm hover-aura"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={14} />
                      View Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </section>
  );
};

export default ProjectsSection;
