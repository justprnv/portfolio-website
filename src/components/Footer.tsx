const Footer = () => {
  return (
    <footer className="bg-secondary py-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-xl mb-4">Pranav Sawant</h3>
          <p className="text-muted-foreground mb-4">
            Aspiring IT Professional | Software Developer | Tech Enthusiast
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Pranav Sawant. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;