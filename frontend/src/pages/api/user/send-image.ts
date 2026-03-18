export const prerender = false;
 
import { getCurrentUser } from "../../../lib/session";
import { sendImageToUser } from "../../../lib/image-commands";
import { getAllUsers } from "../../../lib/users";
 
export async function POST({ request }: { request: Request }) {
  const user = await getCurrentUser(request);
 
  if (!user) {
    return new Response(
      JSON.stringify({ error: "You must be logged in" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
 
  const body = await request.json().catch(() => ({}));
  const { username } = body as { username?: string };
 
  if (!username) {
    return new Response(
      JSON.stringify({ error: "Missing username" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
 
  // Verify target user exists
  const allUsers = await getAllUsers();
  const targetUser = allUsers.find((u) => u.username === username);
 
  if (!targetUser) {
    return new Response(
      JSON.stringify({ error: `User "${username}" not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
 
  // Use the server-side troll image
  sendImageToUser(username, "/goat.gif");
 
  return new Response(
    JSON.stringify({ success: true, message: `Image sent to ${username}` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}