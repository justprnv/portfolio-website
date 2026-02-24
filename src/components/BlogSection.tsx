import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
}

const POSTS_URL = "https://blog-api-worker.pranav-7d5.workers.dev/posts";

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(POSTS_URL);
        if (!res.ok) return;
        const data = await res.json();
        setPosts(data);
      } catch {
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  const getPreview = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 140) return trimmed;
    return trimmed.slice(0, 140) + "…";
  };

  return (
    <section id="blog" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl mb-4">Blog</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thoughts, experiments and learnings from my journey in tech.
          </p>
        </div>

        {/* Frosted glass carousel container - dark mode friendly */}
        <div
          className="rounded-2xl p-6 md:p-8 overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-60">📝</div>
              <p className="text-muted-foreground text-lg">No posts yet. Check back soon.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Scroll horizontally to explore
              </p>
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth -mx-2 px-2">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="min-w-[280px] max-w-[320px] snap-center flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-xl transition-transform hover:scale-[1.02]"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-pink-500/30 flex items-center justify-center text-5xl opacity-80">
                        📝
                      </div>
                    )}
                    <div className="p-5 text-left">
                      <p className="text-[11px] text-muted-foreground mb-2">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <h4 className="text-base font-semibold mb-2 line-clamp-2 text-foreground">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {getPreview(post.content)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;