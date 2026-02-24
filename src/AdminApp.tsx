import { useEffect, useState, type FormEvent } from "react";
import { LogOut, ImageIcon, Key } from "lucide-react";

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
  const [postMessage, setPostMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-white/50">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-[400px]">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
            <h1 className="text-2xl font-semibold text-center mb-8" style={{ fontFamily: "Georgia, serif" }}>
              Blog Admin
            </h1>
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue="justprnv"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
                placeholder="Username"
                autoComplete="username"
              />
              <input
                id="password"
                name="password"
                type="password"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
                placeholder="Password"
                autoComplete="current-password"
              />
              <p className="text-[11px] text-white/40 text-center">
                Default: Pranav@123
              </p>
              {loginError && (
                <p className="text-sm text-red-400 text-center">{loginError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0095f6] hover:bg-[#0095f6]/90 text-white font-semibold text-sm transition-colors"
              >
                Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Instagram-style top bar */}
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="max-w-[630px] mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            Blog Admin
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChangingPassword((prev) => !prev)}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Change Password"
            >
              <Key size={18} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[630px] mx-auto px-4 py-6 space-y-6">
        {isChangingPassword && (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="text-base font-medium mb-4 text-white/90">Update Password</h2>
            <form className="space-y-4 max-w-xl" onSubmit={handleChangePassword}>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                placeholder="Current password"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
              />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="New password"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
              />
              {passwordChangeMessage && (
                <p className={`text-sm ${passwordChangeMessage.includes("success") ? "text-emerald-400" : "text-red-400"}`}>{passwordChangeMessage}</p>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0095f6] hover:bg-[#0095f6]/90 text-white text-sm font-semibold"
              >
                Save
              </button>
            </form>
          </section>
        )}

        <section className="space-y-6">
          {/* Create post card - Instagram-style */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">Create post</span>
              <button
                type="submit"
                form="create-post-form"
                className="text-sm font-semibold text-[#0095f6] hover:text-[#0095f6]/80 transition-colors"
              >
                Post
              </button>
            </div>
            <form id="create-post-form" className="p-4 space-y-4" onSubmit={handleCreatePost}>
              <input
                id="postTitle"
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full px-0 py-2 bg-transparent text-white placeholder-white/40 focus:outline-none text-base"
                placeholder="Title"
              />
              <div className="flex items-center gap-3 py-2">
                <ImageIcon size={20} className="text-white/50 flex-shrink-0" />
                <input
                  id="postImage"
                  type="url"
                  value={newPostImageUrl}
                  onChange={(e) => setNewPostImageUrl(e.target.value)}
                  className="flex-1 bg-transparent text-white/90 placeholder-white/40 focus:outline-none text-sm"
                  placeholder="Image URL (optional)"
                />
              </div>
              <textarea
                id="postContent"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={8}
                className="w-full px-0 py-2 bg-transparent text-white/90 placeholder-white/40 focus:outline-none resize-none text-[15px] leading-relaxed"
                placeholder="What's on your mind?"
              />
              {postMessage && (
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    postMessage.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {postMessage.text}
                </div>
              )}
            </form>
          </div>

          {/* Existing posts - feed style */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-medium text-white/90">Your posts</span>
            </div>
            {posts.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-sm text-white/40">No posts yet</p>
                <p className="text-xs text-white/30 mt-1">Create your first post above</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {posts.map((post) => (
                  <div key={post.id} className="px-4 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex-shrink-0 flex items-center justify-center text-white/80 text-lg">
                          📝
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white/90 line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-white/50 mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-white/60 line-clamp-2 mt-1">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminApp;

