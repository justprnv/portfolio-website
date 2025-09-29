import { Mail, Linkedin, Github, Twitter } from 'lucide-react';

const ContactSection = () => {
  const contactInfo = [
    { icon: Mail, label: "Email", value: "pranavsawant57@gmail.com", href: "mailto:pranavsawant57@gmail.com" }
  ];

  const socialLinks = [
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/justprnv/" },
    { icon: Github, label: "GitHub", href: "https://github.com/justprnv" },
    { icon: Twitter, label: "Twitter", href: "https://x.com/justprnv" },
    { icon: Mail, label: "Email", href: "mailto:pranavsawant57@gmail.com" }
  ];

  return (
    <section id="contact" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Contact Me</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Would you like to work with me or have any ideas for projects? Feel free to DM me on the platforms below!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl mb-8 text-center lg:text-left">Get In Touch</h3>
            <div className="space-y-6 mb-12">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <div key={index} className="flex items-center gap-4 justify-center lg:justify-start hover-aura p-2 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{contact.label}</div>
                      <a 
                        href={contact.href}
                        className="text-lg hover:text-blue-600 transition-colors"
                      >
                        {contact.value}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Social Links */}
            <div className="text-center lg:text-left">
              <h4 className="text-xl mb-6">Connect With Me</h4>
              <div className="flex gap-4 justify-center lg:justify-start">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-muted hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors group hover-aura"
                      aria-label={social.label}
                    >
                      <IconComponent size={20} className="group-hover:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl mb-8 text-center lg:text-left">Send a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm mb-2">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-blue-600 focus:outline-none transition-colors hover-aura"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm mb-2">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-blue-600 focus:outline-none transition-colors hover-aura"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-blue-600 focus:outline-none transition-colors hover-aura"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-blue-600 focus:outline-none transition-colors hover-aura"
                  placeholder="Project Collaboration"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm mb-2">Message</label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-blue-600 focus:outline-none resize-none transition-colors hover-aura"
                  placeholder="Tell me about your project or idea..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors hover-aura flex items-center justify-center"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;