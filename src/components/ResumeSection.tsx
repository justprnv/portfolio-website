import { Calendar, Building } from 'lucide-react';

const ResumeSection = () => {
  const workExperience = [
    {
      title: "TechDev / Mentor",
      company: "RocketHacks",
      duration: "Nov 2024 - Present · 9 mos",
      description: "Leadership, team building, and mentoring aspiring developers.",
      type: "work"
    },
    {
      title: "Safety Education Instructor",
      company: "The University of Toledo",
      duration: "Feb 2025 - Present · 6 mos",
      description: "Part-time role focused on leadership, organization skills, and safety education.",
      type: "work"
    },
    {
      title: "Lifeguard",
      company: "The University of Toledo",
      duration: "Apr 2024 - Present · 1 yr 4 mos",
      description: "Customer service, first aid, and emergency response skills applied daily.",
      type: "work"
    },
    {
      title: "IT Support Specialist (Internship)",
      company: "Bucks India",
      duration: "May 2023 - Dec 2023 · 8 mos",
      description: "Provided front-line IT support, diagnosing and resolving hardware, software, and network issues. Guided users through troubleshooting steps to prevent recurring problems.",
      type: "work"
    },
    {
      title: "Team Leader (Internship)",
      company: "Viral Fission",
      duration: "Jul 2021 - Aug 2022 · 1 yr 2 mos",
      description: "Led a team on project development and delivery during internship.",
      type: "work"
    },
    {
      title: "Design/Graphic Intern",
      company: "VSIT",
      duration: "Feb 2022 - Mar 2022 · 2 mos",
      description: "Assisted in graphic design and visual content creation projects.",
      type: "work"
    }
  ];

  const education = [
    {
      title: "Bachelor's degree, Information Technology",
      company: "The University of Toledo",
      duration: "Jan 2024 - Dec 2025",
      description: "Focused on core IT subjects and practical skills development.",
      type: "education"
    },
    {
      title: "BSc-IT, Information Technology",
      company: "Vidyalankar School of Information Technology",
      duration: "Jun 2022 - Jun 2023",
      description: "Completed Bachelor of Science program in IT with focus on software development.",
      type: "education"
    },
    {
      title: "Diploma, Computer Engineering",
      company: "Vidyalankar Polytechnic",
      duration: "Mar 2019 - Mar 2022",
      description: "Fundamental diploma covering core engineering concepts and computer systems.",
      type: "education"
    }
  ];

  return (
    <section id="resume" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Resume</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here are my work experiences and education.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Work Experience */}
          <div>
            <h3 className="text-2xl mb-8 text-blue-600">Work Experience</h3>
            <div className="space-y-6">
              {workExperience.map((job, index) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-blue-100 dark:border-blue-900 last:border-l-0">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="bg-card p-6 rounded-lg shadow-md">
                    <h4 className="text-lg mb-2">{job.title}</h4>
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building size={14} />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {job.duration}
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed">{job.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education */}
          <div>
            <h3 className="text-2xl mb-8 text-green-600">Background Education</h3>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-green-100 dark:border-green-900 last:border-l-0">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-green-600 rounded-full"></div>
                  <div className="bg-card p-6 rounded-lg shadow-md">
                    <h4 className="text-lg mb-2">{edu.title}</h4>
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building size={14} />
                        {edu.company}
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed">{edu.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;