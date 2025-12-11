import { Code, Award, Lightbulb, Clock, Users, BookOpen, ExternalLink } from 'lucide-react';

const SkillsSection = () => {
  const stats = [
    { icon: Code, number: "150+", label: "Projects Completed" },
    { icon: Award, number: "7+", label: "Certifications Obtained" },
    { icon: Lightbulb, number: "100+", label: "Crazy Ideas" },
    { icon: Clock, number: "1000+", label: "Hours Coding" },
    { icon: Users, number: "2000+", label: "Network" },
    { icon: BookOpen, number: "100+", label: "Books Read" }
  ];

  const skills = [
    { category: "Programming Languages", items: ["Python", "JavaScript", "Java", "C++", "SQL"] },
    { category: "Web Technologies", items: ["HTML/CSS", "React", "Node.js", "Express", "RESTful APIs"] },
    { category: "Databases", items: ["SQLite", "MySQL", "MongoDB", "Database Design"] },
    { category: "Tools & Technologies", items: ["Git", "VS Code", "Linux", "Windows", "Agile"] },
    { category: "Soft Skills", items: ["Leadership", "Team Collaboration", "Problem Solving", "Mentoring", "Communication"] }
  ];

  const certifications = [
    {
      title: "Google IT Support Professional",
      authority: "Google",
      link: "https://www.coursera.org/account/accomplishments/professional-cert/E56S8JJC4SLL",
      progress: 100
    },
    {
      title: "Google Cybersecurity Professional",
      authority: "Google",
      link: "https://www.coursera.org/account/accomplishments/professional-cert/Z8688JJC4SLL",
      progress: 47
    }
  ];

  return (
    <section id="skills" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Skills & Tools</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise and achievements.
          </p>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-card p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow card-glow">
                <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl mb-2 text-blue-600">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
        
        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {skills.map((skillSet, index) => (
            <div key={index} className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow card-glow">
              <h3 className="text-xl mb-4 text-blue-600">{skillSet.category}</h3>
              <div className="space-y-2">
                {skillSet.items.map((skill, skillIndex) => (
                  <div key={skillIndex} className="flex items-center p-1 rounded">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-foreground">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Certifications Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl mb-4">Certifications & Learning Journey</h3>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              My professional certifications and ongoing learning progress
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow card-glow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-2 text-foreground">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{cert.authority}</p>
                  </div>
                  <Award className="w-6 h-6 text-blue-600 flex-shrink-0 ml-4" />
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progress</span>
                    <span className="text-sm font-semibold text-blue-600">{cert.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${cert.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* View Button */}
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm hover-aura"
                >
                  <span>View Certification</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;