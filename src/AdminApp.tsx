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
const POSTS_URL = "https://pranavsawant.com/api/posts";

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
    if (!newPostTitle.trim() || !newPostContent.trim()) {
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
        return;
      }

      const created: BlogPost = await res.json();
      setPosts((prev) => [created, ...prev]);

      setNewPostTitle("");
      setNewPostImageUrl("");
      setNewPostContent("");
    } catch {
      // ignore for now
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-lg">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Lock className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Login</h1>
              <p className="text-sm text-muted-foreground">
                Secure access to your blog dashboard
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue="justprnv"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                  autoComplete="current-password"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Default password is <span className="font-mono">Pranav@123</span>. Please change it
                after logging in.
              </p>
            </div>

            {loginError && (
              <p className="text-sm text-red-500">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Blog Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Logged in as <span className="font-mono">justprnv</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsChangingPassword((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted/60 transition-colors flex items-center gap-1"
            >
              <Key size={14} />
              <span>Change Password</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-1"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {isChangingPassword && (
          <section className="bg-card border border-border rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key size={18} className="text-blue-600" />
              <span>Update Admin Password</span>
            </h2>
            <form className="space-y-4 max-w-xl" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-sm mb-2" htmlFor="oldPassword">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
              {passwordChangeMessage && (
                <p className="text-sm text-blue-600">{passwordChangeMessage}</p>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>Save New Password</span>
              </button>
            </form>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <span>Create New Blog Post</span>
            </h2>
            <form className="space-y-4" onSubmit={handleCreatePost}>
              <div>
                <label className="block text-sm mb-2" htmlFor="postTitle">
                  Title
                </label>
                <input
                  id="postTitle"
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="Your blog title"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" htmlFor="postImage">
                  Image URL (optional)
                </label>
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-muted-foreground" />
                  <input
                    id="postImage"
                    type="url"
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" htmlFor="postContent">
                  Content
                </label>
                <div className="flex items-start gap-2">
                  <FileText size={16} className="mt-2 text-muted-foreground" />
                  <textarea
                    id="postContent"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-blue-600 focus:outline-none transition-colors resize-y"
                    placeholder="Write your blog content here. You can use emojis, paragraphs, etc."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Post</span>
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>Existing Posts</span>
            </h2>
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No posts yet. Use the form on the left to add your first blog
                post.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border border-border bg-muted/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold">{post.title}</h3>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
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

