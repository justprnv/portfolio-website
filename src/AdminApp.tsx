import { useEffect, useState, type FormEvent } from "react";
import { LogOut, Key } from "lucide-react";
import DarkModeToggle from "./components/DarkModeToggle";

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
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 border border-border">
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
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors min-h-[44px]"
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
                  <label htmlFor="postImage" className="block text-sm font-medium text-foreground mb-2">Image URL <span className="text-muted-foreground">(optional)</span></label>
                  <input
                    id="postImage"
                    type="url"
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:border-blue-600 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label htmlFor="postContent" className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <textarea
                    id="postContent"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:border-blue-600 focus:outline-none resize-y min-h-[120px]"
                    placeholder="Write your blog content..."
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
                    <div key={post.id} className="px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex gap-3">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-blue-600/20 flex items-center justify-center text-2xl flex-shrink-0">📝</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2">{post.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminApp;

