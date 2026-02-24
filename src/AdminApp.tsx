import { useEffect, useState, type FormEvent } from "react";
import {
  Lock,
  ShieldCheck,
  LogOut,
  Plus,
  ImageIcon,
  FileText,
  User,
  Key,
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <p className="text-slate-400">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="w-full max-w-md bg-slate-800/60 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Lock className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">Admin Login</h1>
              <p className="text-sm text-slate-400">
                Secure access to your blog dashboard
              </p>
            </div>
          </div>

            <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue="justprnv"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                  autoComplete="current-password"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Default: <span className="font-mono text-slate-400">Pranav@123</span> — change after first login.
              </p>
            </div>

            {loginError && (
              <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <ShieldCheck size={18} />
              <span>Sign In</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Blog Admin</h1>
              <p className="text-xs text-slate-400">
                Logged in as <span className="font-mono text-slate-300">justprnv</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChangingPassword((prev) => !prev)}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm text-slate-300 hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2"
            >
              <Key size={14} />
              <span>Change Password</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {isChangingPassword && (
          <section className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-100">
              <Key size={18} className="text-blue-400" />
              <span>Update Admin Password</span>
            </h2>
            <form className="space-y-4 max-w-xl" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="oldPassword">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                />
              </div>
              {passwordChangeMessage && (
                <p className={`text-sm ${passwordChangeMessage.includes("success") ? "text-emerald-400" : "text-red-400"}`}>{passwordChangeMessage}</p>
              )}
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <ShieldCheck size={16} />
                <span>Save New Password</span>
              </button>
            </form>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8">
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-600/80 flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <span>Create New Blog Post</span>
            </h2>
            <form className="space-y-5" onSubmit={handleCreatePost}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="postTitle">
                  Title
                </label>
                <input
                  id="postTitle"
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                  placeholder="Your blog title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="postImage">
                  Image URL <span className="text-slate-500">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-slate-500 flex-shrink-0" />
                  <input
                    id="postImage"
                    type="url"
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="postContent">
                  Content
                </label>
                <div className="flex items-start gap-2">
                  <FileText size={16} className="mt-3 text-slate-500 flex-shrink-0" />
                  <textarea
                    id="postContent"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all resize-y font-mono text-sm leading-relaxed"
                    placeholder="Write your blog content here. You can use emojis, paragraphs, markdown-style formatting, etc."
                  />
                </div>
              </div>
              {postMessage && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    postMessage.type === "success"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                      : "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40"
                  }`}
                >
                  {postMessage.text}
                </div>
              )}
              <button
                type="submit"
                className="w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
              >
                <Plus size={18} />
                <span>Add Post</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-600/80 flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <span>Existing Posts</span>
            </h2>
            {posts.length === 0 ? (
              <div className="text-center py-12 rounded-xl bg-slate-900/40 border border-dashed border-white/10">
                <p className="text-sm text-slate-400">
                  No posts yet. Create your first post with the form.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-100 line-clamp-2">{post.title}</h3>
                      <span className="text-[11px] text-slate-500 flex-shrink-0">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
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

