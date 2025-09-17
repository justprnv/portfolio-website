import { X, Github, Calendar, Users, Code } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProjectModalProps {
  project: {
    title: string;
    description: string;
    longDescription: string;
    image: string;
    screenshots: string[];
    technologies: string[];
    category: string;
    status: 'completed' | 'coming-soon';
    duration?: string;
    teamSize?: number;
    features?: string[];
    challenges?: string[];
    github?: string;
    demo?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {/* Header */}
        <div className="relative">
          <ImageWithFallback
            src={project.image}
            alt={project.title}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              project.status === 'coming-soon' 
                ? 'bg-black text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {project.status === 'coming-soon' ? 'Coming Soon' : project.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-3xl mb-4">{project.title}</h2>
          
          {/* Project Info */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            {project.duration && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {project.duration}
              </div>
            )}
            {project.teamSize && (
              <div className="flex items-center gap-1">
                <Users size={16} />
                {project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Code size={16} />
              {project.technologies.length} technologies
            </div>
          </div>

          <p className="text-lg mb-6 leading-relaxed">{project.longDescription}</p>

          {/* Technologies */}
          <div className="mb-6">
            <h3 className="text-xl mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl mb-3">Key Features</h3>
              <ul className="list-disc list-inside space-y-2">
                {project.features.map((feature, index) => (
                  <li key={index} className="text-muted-foreground">{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {project.challenges && project.challenges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl mb-3">Technical Challenges</h3>
              <ul className="list-disc list-inside space-y-2">
                {project.challenges.map((challenge, index) => (
                  <li key={index} className="text-muted-foreground">{challenge}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Screenshots */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl mb-3">Screenshots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.screenshots.map((screenshot, index) => (
                  <ImageWithFallback
                    key={index}
                    src={screenshot}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {project.status !== 'coming-soon' && project.github && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                <Github size={16} />
                View Code
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;