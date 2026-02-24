import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
}

const POSTS_URL = "https://blog-api-worker.pranav-7d5.workers.dev/posts";

/** Get first 3–4 sentences or ~220 chars for excerpt */
function getExcerpt(content: string, maxSentences = 4): string {
  const plain = content.replace(/#{1,6}\s/g, "").replace(/\*\*?|__?|\*|_/g, "").trim();
  const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  const take = sentences.slice(0, maxSentences).join(" ");
  if (take.length <= 220) return take;
  return take.slice(0, 217).trim() + "…";
}

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [modalPost, setModalPost] = useState<BlogPost | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = 320 + 24; // card max-w + gap
    const amount = direction === "left" ? -cardWidth : cardWidth;
    el.scrollBy({ left: amount, behavior: "smooth" });
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

        <div
          className="p-6 md:p-8 overflow-hidden"
          style={{
            borderRadius: "24px",
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
            <div className="relative">
              <p className="text-sm text-muted-foreground mb-4">Scroll or use arrows to explore</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Previous posts"
                >
                  <ChevronLeft size={22} />
                </button>
                <div
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth flex-1 min-w-0 scrollbar-thin"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => setModalPost(post)}
                      className="min-w-[280px] max-w-[320px] snap-center flex-shrink-0 overflow-hidden border border-white/10 shadow-xl transition-transform hover:scale-[1.02] cursor-pointer"
                      style={{
                        borderRadius: "16px",
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
                          style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
                        />
                      ) : (
                        <div
                          className="w-full h-44 bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-pink-500/30 flex items-center justify-center text-5xl opacity-80"
                          style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
                        >
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
                          {getExcerpt(post.content)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Next posts"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setModalPost(null)}
        >
          <div
            className="bg-card border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            style={{ borderRadius: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h3 className="text-xl font-semibold text-foreground pr-4 truncate flex-1 min-w-0">{modalPost.title}</h3>
              <button
                type="button"
                onClick={() => setModalPost(null)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} />
                Close
              </button>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {new Date(modalPost.createdAt).toLocaleDateString()}
              </p>
              {modalPost.imageUrl && (
                <img
                  src={modalPost.imageUrl}
                  alt={modalPost.title}
                  className="w-full object-cover max-h-64"
                  style={{ borderRadius: "12px" }}
                />
              )}
              <div className="prose prose-invert prose-sm max-w-none text-foreground [&_a]:text-blue-400 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{modalPost.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
