import { ImageWithFallback } from './figma/ImageWithFallback';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">About Me</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-3xl mb-6">Pranav Sawant</h3>
            <p className="text-lg mb-6 leading-relaxed">
              Hello! I'm Pranav Sawant, a passionate Information Technology student at the University of Toledo. I have a keen interest in software development, IT support, and mentoring others. I enjoy tackling challenging projects, learning new technologies, and collaborating with teams to create innovative solutions.
            </p>
            <p className="text-lg leading-relaxed">
              Outside of academics, I am a tech enthusiast and lifelong learner who loves coding, problem-solving, and exploring emerging trends in IT. I look forward to growing my skills and contributing meaningfully to the tech community.
            </p>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative hover-aura">
              <ImageWithFallback
                src="/src/img/pranav_pfp.JPEG"
                alt="Pranav Sawant"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;