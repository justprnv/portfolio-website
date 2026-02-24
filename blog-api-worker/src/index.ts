export interface Env {
	DB: D1Database;
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
  
	  // Protected: POST /posts -> create a new post (only allowed behind Cloudflare Access)
	  if (request.method === "POST" && path === "/posts") {
		// Optional extra check: only allow your email from Cloudflare Access
		const email = request.headers.get("CF-Access-Authenticated-User-Email");
		if (!email || email.toLowerCase() !== "contact@pranavsawant.com") {
		  return new Response("Unauthorized", { status: 401 });
		}
  
		const body = await request.json().catch(() => null);
		if (!body || !body.title || !body.content) {
		  return new Response("Invalid payload", { status: 400 });
		}
  
		const id = crypto.randomUUID();
		const createdAt = new Date().toISOString();
		const imageUrl = body.imageUrl ?? null;
  
		await env.DB.prepare(
		  "INSERT INTO posts (id, title, image_url, content, created_at) VALUES (?, ?, ?, ?, ?)"
		)
		  .bind(id, body.title, imageUrl, body.content, createdAt)
		  .run();
  
		return new Response(
		  JSON.stringify({ id, title: body.title, imageUrl, content: body.content, createdAt }),
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