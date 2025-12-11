const BlogSection = () => {
  return (
    <section id="blog" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl mb-4">Blog</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <div className="bg-card p-12 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-2xl mb-4">Coming Soon...</h3>
            <p className="text-muted-foreground leading-relaxed">
              I'm currently working on creating valuable content for developers and tech enthusiasts. 
              Stay tuned for articles about software development, IT insights, and my learning journey.
              For now, you can check out my posts on LinkedIn!
            </p>
            <div className="mt-8">
              <a 
                href="https://www.linkedin.com/in/justprnv/recent-activity/all/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                View My LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;