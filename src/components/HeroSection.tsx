import { ImageWithFallback } from './figma/ImageWithFallback';

const HeroSection = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://cdn.pixabay.com/video/2021/08/04/84293-588610648_large.mp4"
            type="video/mp4"
          />
          {/* Fallback image if video doesn't load */}
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWNofGVufDF8fHx8MTc1NTMwOTkxNnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Tech workspace background"
            className="w-full h-full object-cover"
          />
        </video>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl mb-6 animate-fade-in">
          Welcome to my Portfolio
        </h1>
        <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">
          I'm <span className="text-blue-400">Pranav Sawant</span>, an aspiring IT professional currently pursuing a Bachelor's degree in Information Technology at the University of Toledo, set to graduate in December 2025.
        </p>
        <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto animate-fade-in-delay-2">
          With a foundation rooted in strong technical knowledge and a passion for continuous growth, I thrive in collaborative environments that value innovation and curiosity. Through academic projects and hands-on learning, I've developed the skills, mindset, and enthusiasm that contribute positively to any team's goals.
        </p>
        <button
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-colors animate-fade-in-delay-3"
        >
          Explore My Journey
        </button>
      </div>
    </section>
  );
};

export default HeroSection;