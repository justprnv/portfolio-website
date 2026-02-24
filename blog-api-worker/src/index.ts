export interface Env {
	DB: D1Database;
	ALLOW_OPEN_POST?: string;
  }
  
  export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  const url = new URL(request.url);
	  const path = url.pathname;
  
	  // Public: GET /posts -> list posts
	  if (request.method === "GET" && path === "/posts") {
		const { results } = await env.DB.prepare(
		  "SELECT id, title, image_url as imageUrl, content, created_at as createdAt FROM posts ORDER BY datetime(created_at) DESC"
		).all();
  
		return new Response(JSON.stringify(results ?? []), {
		  headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		  },
		});
	  }
  
	  // Preflight for POST (CORS)
	  if (request.method === "OPTIONS") {
		return new Response(null, {
		  headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, CF-Access-Authenticated-User-Email",
		  },
		});
	  }
  
	  // Protected: POST /posts -> create a new post
	  if (request.method === "POST" && path === "/posts") {
		// Require Cloudflare Access email, OR allow if ALLOW_OPEN_POST is "true" (for dev before Access is set up)
		const allowOpen = env.ALLOW_OPEN_POST === "true";
		const email = request.headers.get("CF-Access-Authenticated-User-Email");
		const isAuthorized = allowOpen || (email && email.toLowerCase() === "contact@pranavsawant.com");
		if (!isAuthorized) {
		  return new Response("Unauthorized. Set up Cloudflare Access for the API, or use ALLOW_OPEN_POST for dev.", { status: 401 });
		}
  
		const raw = await request.json().catch(() => null) as { title?: string; content?: string; imageUrl?: string } | null;
		if (!raw || !raw.title || !raw.content) {
		  return new Response("Invalid payload", { status: 400 });
		}

		const id = crypto.randomUUID();
		const createdAt = new Date().toISOString();
		const imageUrl = raw.imageUrl ?? null;

		await env.DB.prepare(
		  "INSERT INTO posts (id, title, image_url, content, created_at) VALUES (?, ?, ?, ?, ?)"
		)
		  .bind(id, raw.title, imageUrl, raw.content, createdAt)
		  .run();

		return new Response(
		  JSON.stringify({ id, title: raw.title, imageUrl, content: raw.content, createdAt }),
		  {
			status: 201,
			headers: {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*",
			},
		  }
		);
	  }
  
	  return new Response("Not found", { status: 404 });
	},
  } satisfies ExportedHandler<Env>;