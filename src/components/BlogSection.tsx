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

  // Lock page scroll while modal is open so only the post scrolls
  useEffect(() => {
    if (modalPost) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [modalPost]);

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
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/70 backdrop-blur-sm"
          onClick={() => setModalPost(null)}
        >
          {/* Close button pinned to very top-right of the screen */}
          <button
            type="button"
            onClick={() => setModalPost(null)}
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            Close
            <X size={16} />
          </button>

          {/* 16:9 frosted modal card – scrolls inside, always smaller than page */}
          <div
            className="w-full"
            style={{ maxWidth: "1120px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-scroll h-full overflow-y-auto"
              style={{
                aspectRatio: "16 / 9",
                maxHeight: "80vh",
                borderRadius: "24px",
                background: "rgba(15, 23, 42, 0.72)",
                backdropFilter: "blur(26px)",
                WebkitBackdropFilter: "blur(26px)",
                border: "1px solid rgba(148, 163, 184, 0.30)",
                boxShadow: "0 18px 60px rgba(0, 0, 0, 0.65)",
                padding: "24px",
              }}
            >
              <div className="flex h-full flex-col">
                <header className="mb-4 md:mb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-white">
                    {modalPost.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-white/70">
                    {new Date(modalPost.createdAt).toLocaleDateString()}
                  </p>
                </header>

                <main className="flex-1 space-y-5 md:space-y-6 overflow-y-auto pr-1">
                  {modalPost.imageUrl ? (
                    <div
                      className="relative w-full overflow-hidden"
                      style={{
                        borderRadius: "18px",
                        aspectRatio: "3 / 2",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.10)",
                      }}
                    >
                      <img
                        src={modalPost.imageUrl}
                        alt={modalPost.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex w-full items-center justify-center text-5xl text-white/80"
                      style={{
                        borderRadius: "18px",
                        aspectRatio: "3 / 2",
                        background:
                          "linear-gradient(135deg, rgba(37, 99, 235, 0.45), rgba(168, 85, 247, 0.45))",
                        border: "1px solid rgba(255, 255, 255, 0.10)",
                      }}
                    >
                      📝
                    </div>
                  )}

                  <div
                    className="prose prose-invert prose-sm sm:prose-base max-w-none text-white/90 [&_a]:text-blue-300 [&_strong]:text-white [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal"
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.10)",
                      borderRadius: "18px",
                      padding: "20px",
                    }}
                  >
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{modalPost.content}</ReactMarkdown>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
