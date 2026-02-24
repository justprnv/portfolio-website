import { useEffect, useState, useRef, type FormEvent } from "react";
import { LogOut, Key, Trash2, Eye, Bold, Italic, Underline, List, Link as LinkIcon, Heading2, Heading3 } from "lucide-react";
import DarkModeToggle from "./components/DarkModeToggle";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface AdminCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

interface BlogPost {
  id: string;
  title: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
}

const CREDENTIALS_KEY = "ps_admin_credentials_v1";
const LOCK_KEY = "ps_admin_lock_until";
const POSTS_URL = "https://blog-api-worker.pranav-7d5.workers.dev/posts";

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const AdminApp = () => {
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostImageUrl, setNewPostImageUrl] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [postFont, setPostFont] = useState<"sans" | "serif" | "mono">("sans");
  const [postMessage, setPostMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme || savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const storedCreds = localStorage.getItem(CREDENTIALS_KEY);
      if (storedCreds) {
        setCredentials(JSON.parse(storedCreds));
      } else {
        const username = "justprnv";
        const salt = generateSalt();
        const passwordHash = await hashPassword("Pranav@123", salt);
        const initialCreds: AdminCredentials = { username, salt, passwordHash };
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(initialCreds));
        setCredentials(initialCreds);
      }

      const storedLock = localStorage.getItem(LOCK_KEY);
      if (storedLock) {
        setLockUntil(Number(storedLock));
      }

      await fetchPosts();

      setIsInitialized(true);
    })();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials) return;

    const now = Date.now();
    if (lockUntil && now < lockUntil) {
      const secondsLeft = Math.ceil((lockUntil - now) / 1000);
      setLoginError(
        `Too many failed attempts. Try again in ${secondsLeft} seconds.`
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const username = (formData.get("username") as string) || "";
    const password = (formData.get("password") as string) || "";

    const hashed = await hashPassword(password, credentials.salt);
    if (username !== credentials.username || hashed !== credentials.passwordHash) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);

      if (nextFailed >= 5) {
        const lockTime = Date.now() + 5 * 60 * 1000;
        setLockUntil(lockTime);
        localStorage.setItem(LOCK_KEY, String(lockTime));
        setLoginError(
          "Too many failed attempts. Login has been temporarily locked for 5 minutes."
        );
      } else {
        setLoginError("Invalid username or password.");
      }
      return;
    }

    setIsAuthenticated(true);
    setFailedAttempts(0);
    setLoginError("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials) return;

    const formData = new FormData(event.currentTarget);
    const oldPassword = (formData.get("oldPassword") as string) || "";
    const newPassword = (formData.get("newPassword") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";

    setPasswordChangeMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage("New passwords do not match.");
      return;
    }

    const oldHash = await hashPassword(oldPassword, credentials.salt);
    if (oldHash !== credentials.passwordHash) {
      setPasswordChangeMessage("Old password is incorrect.");
      return;
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);
    const updated: AdminCredentials = {
      username: credentials.username,
      salt: newSalt,
      passwordHash: newHash,
    };

    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
    setCredentials(updated);
    setPasswordChangeMessage("Password updated successfully.");
    setIsChangingPassword(false);
  };

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPostMessage(null);
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setPostMessage({ type: "error", text: "Title and content are required." });
      return;
    }

    try {
      const res = await fetch(POSTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          imageUrl: newPostImageUrl.trim() || null,
          content: newPostContent.trim(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setPostMessage({
          type: "error",
          text: res.status === 401
            ? "Unauthorized. Set up Cloudflare Access for the API or ensure ALLOW_OPEN_POST is enabled."
            : `Failed to add post (${res.status}). ${errText || ""}`,
        });
        return;
      }

      const created: BlogPost = await res.json();
      setPosts((prev) => [created, ...prev]);
      setNewPostTitle("");
      setNewPostImageUrl("");
      setNewPostContent("");
      setPostMessage({ type: "success", text: "Post published successfully!" });
      setTimeout(() => setPostMessage(null), 4000);
    } catch (e) {
      setPostMessage({
        type: "error",
        text: `Network error. Check the API URL and CORS. ${e instanceof Error ? e.message : ""}`,
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${POSTS_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setPostMessage({ type: "error", text: "Failed to delete post." });
    } finally {
      setDeletingId(null);
    }
  };

  const insertAtCursor = (before: string, after: string = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = newPostContent;
    const newText = text.slice(0, start) + before + (text.slice(start, end) || "text") + after + text.slice(end);
    setNewPostContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + (end - start || 4));
    }, 0);
  };

  const fontClass = postFont === "serif" ? "font-serif" : postFont === "mono" ? "font-mono" : "font-sans";

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        <div className="w-full max-w-md sm:max-w-sm">
          <div className="bg-card rounded-xl shadow-md p-6 sm:p-8 border border-border">
            <h2 className="text-2xl sm:text-3xl mb-2 text-center text-foreground">Blog Admin</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Sign in to manage your blog</p>
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue="justprnv"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <p className="mt-2 text-xs text-muted-foreground">Default: Pranav@123</p>
              </div>
              {loginError && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{loginError}</p>
              )}
              <button
                type="submit"
                className="w-full py-4 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors shadow-lg hover:shadow-xl min-h-[48px]"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Blog Admin</h1>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button
                type="button"
                onClick={() => setIsChangingPassword((prev) => !prev)}
                className="p-2 sm:px-3 sm:py-2 rounded-lg border border-border hover:bg-muted/50 text-foreground transition-colors text-sm"
                title="Change Password"
              >
                <Key size={18} className="sm:inline" />
                <span className="hidden sm:inline ml-1">Password</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm flex items-center gap-1"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isChangingPassword && (
          <section className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Update Password</h2>
            <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-foreground mb-2">Current password</label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">Confirm new password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:border-blue-600 focus:outline-none"
                />
              </div>
              {passwordChangeMessage && (
                <p className={`text-sm ${passwordChangeMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>{passwordChangeMessage}</p>
              )}
              <button type="submit" className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold min-h-[44px]">
                Save
              </button>
            </form>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-foreground">Create New Post</h2>
                <button
                  type="submit"
                  form="create-post-form"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors min-h-[48px] shadow-lg hover:shadow-xl"
                >
                  Add Post
                </button>
              </div>
              <form id="create-post-form" className="p-4 sm:p-6 space-y-4" onSubmit={handleCreatePost}>
                <div>
                  <label htmlFor="postTitle" className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <input
                    id="postTitle"
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:border-blue-600 focus:outline-none"
                    placeholder="Post title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Image <span className="text-muted-foreground">(optional)</span></label>
                  <input
                    type="url"
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground text-sm mb-2"
                    placeholder="Paste image URL or upload below"
                  />
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500"); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-500"); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-blue-500");
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith("image/")) {
                        const r = new FileReader();
                        r.onload = () => setNewPostImageUrl(String(r.result));
                        r.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById("postImageFile")?.click()}
                  >
                    <input
                      id="postImageFile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = () => setNewPostImageUrl(String(r.result));
                          r.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                    {newPostImageUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={newPostImageUrl} alt="Preview" className="max-h-32 rounded-lg object-cover" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setNewPostImageUrl(""); }} className="text-sm text-red-500 hover:underline">Remove image</button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Drop image here or click to choose from PC</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <label htmlFor="postContent" className="block text-sm font-medium text-foreground">Content</label>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-muted-foreground mr-1">Font:</span>
                      <select
                        value={postFont}
                        onChange={(e) => setPostFont(e.target.value as "sans" | "serif" | "mono")}
                        className="text-sm rounded-lg border border-border bg-background text-foreground px-2 py-1"
                      >
                        <option value="sans">Sans</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Mono</option>
                      </select>
                      <button type="button" onClick={() => insertAtCursor("**", "**")} className="p-1.5 rounded hover:bg-muted" title="Bold"><Bold size={16} /></button>
                      <button type="button" onClick={() => insertAtCursor("_", "_")} className="p-1.5 rounded hover:bg-muted" title="Italic"><Italic size={16} /></button>
                      <button type="button" onClick={() => insertAtCursor("<u>", "</u>")} className="p-1.5 rounded hover:bg-muted" title="Underline"><Underline size={16} /></button>
                      <button type="button" onClick={() => insertAtCursor("## ", "")} className="p-1.5 rounded hover:bg-muted" title="Heading 2"><Heading2 size={16} /></button>
                      <button type="button" onClick={() => insertAtCursor("### ", "")} className="p-1.5 rounded hover:bg-muted" title="Heading 3"><Heading3 size={16} /></button>
                      <button type="button" onClick={() => insertAtCursor("\n- ", "")} className="p-1.5 rounded hover:bg-muted" title="Bullet list"><List size={16} /></button>
                      <button type="button" onClick={() => insertAtCursor("[", "](url)")} className="p-1.5 rounded hover:bg-muted" title="Link"><LinkIcon size={16} /></button>
                      <button type="button" onClick={() => setShowPreview(true)} className="p-1.5 rounded bg-blue-600/20 text-blue-600 hover:bg-blue-600/30 flex items-center gap-1 text-sm" title="Preview on portfolio"><Eye size={16} /> Preview</button>
                    </div>
                  </div>
                  <textarea
                    ref={contentRef}
                    id="postContent"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={10}
                    className={`w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground focus:border-blue-600 focus:outline-none resize-y min-h-[120px] ${fontClass}`}
                    placeholder="Write your blog content... Use the toolbar for **bold**, _italic_, ## headings, - lists."
                  />
                </div>
                {postMessage && (
                  <div className={`px-4 py-3 rounded-lg text-sm ${postMessage.type === "success" ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
                    {postMessage.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Your Posts</h2>
              </div>
              {posts.length === 0 ? (
                <div className="px-4 sm:px-6 py-12 text-center">
                  <p className="text-muted-foreground text-sm">No posts yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Create your first post</p>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                  {posts.map((post) => (
                    <div key={post.id} className="px-4 sm:px-6 py-3 hover:bg-muted/30 transition-colors flex items-center gap-3">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-lg flex-shrink-0">📝</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{post.content.replace(/#{1,6}\s|\*\*?|__?/g, "").trim().slice(0, 120)}{(post.content.replace(/#{1,6}\s|\*\*?|__?/g, "").trim().length > 120 ? "…" : "")}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingId === post.id}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors flex-shrink-0"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="bg-card border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ borderRadius: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Portfolio preview</h3>
              <button type="button" onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-muted text-foreground">×</button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
              <p className="text-sm text-muted-foreground">How your post will appear on the blog section:</p>
              <article className="min-w-0 max-w-[320px] overflow-hidden border border-border bg-muted/30" style={{ borderRadius: "16px" }}>
                {newPostImageUrl ? (
                  <img src={newPostImageUrl} alt="" className="w-full h-44 object-cover" style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }} />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-blue-600/40 to-purple-600/30 flex items-center justify-center text-4xl" style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>📝</div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-foreground line-clamp-2">{newPostTitle || "Post title"}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4 mt-2">
                    {newPostContent ? newPostContent.replace(/#{1,6}\s|\*\*?|__?/g, "").trim().slice(0, 220) + "…" : "Content preview…"}
                  </p>
                </div>
              </article>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Full content (as in modal):</p>
                <div className={`prose prose-invert prose-sm max-w-none text-foreground ${fontClass} [&_a]:text-blue-400 [&_strong]:font-semibold [&_em]:italic`}>
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{newPostContent || "*No content yet*"}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApp;

