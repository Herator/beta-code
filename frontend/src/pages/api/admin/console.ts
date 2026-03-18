export const prerender = false;
 
import { getCurrentUser } from "../../../lib/session";
import { sendImageToUser } from "../../../lib/image-commands";
import { getAllUsers } from "../../../lib/users";
 
export async function POST({ request }: { request: Request }) {
  const user = await getCurrentUser(request);
 
  if (!user || !user.is_admin) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
 
  const body = await request.json().catch(() => ({}));
  const { username, imageUrl } = body as { username?: string; imageUrl?: string };
 
  if (!username || !imageUrl) {
    return new Response(
      JSON.stringify({ error: "Missing username or imageUrl" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
 
  const allUsers = await getAllUsers();
 
  // Resolve target usernames: "all" sends to everyone, otherwise comma-separated
  let targetNames: string[];
  if (username.trim().toLowerCase() === "all") {
    targetNames = allUsers.filter((u) => !u.is_admin).map((u) => u.username);
  } else {
    targetNames = username.split(",").map((n) => n.trim()).filter(Boolean);
  }
 
  // Verify all targets exist
  const notFound: string[] = [];
  for (const name of targetNames) {
    if (!allUsers.find((u) => u.username === name)) {
      notFound.push(name);
    }
  }
 
  if (notFound.length > 0) {
    return new Response(
      JSON.stringify({ error: `User(s) not found: ${notFound.join(", ")}` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
 
  if (targetNames.length === 0) {
    return new Response(
      JSON.stringify({ error: "No target users found" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
 
  for (const name of targetNames) {
    sendImageToUser(name, imageUrl);
  }
 
  const msg = targetNames.length === 1
    ? `Image sent to ${targetNames[0]}`
    : `Image sent to ${targetNames.length} users: ${targetNames.join(", ")}`;
 
  return new Response(
    JSON.stringify({ success: true, message: msg }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}