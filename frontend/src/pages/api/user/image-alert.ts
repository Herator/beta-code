export const prerender = false;
 
import { getCurrentUser } from "../../../lib/session";
import { popImageForUser } from "../../../lib/image-commands";
 
export async function GET({ request }: { request: Request }) {
  const user = await getCurrentUser(request);
 
  if (!user) {
    return new Response(
      JSON.stringify({ image: null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
 
  const cmd = popImageForUser(user.username);
 
  return new Response(
    JSON.stringify({ image: cmd ? cmd.imageUrl : null }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}