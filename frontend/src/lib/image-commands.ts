
interface ImageCommand {
  imageUrl: string;
  sentAt: number;
}
 
const pendingImages = new Map<string, ImageCommand>();
 
export function sendImageToUser(username: string, imageUrl: string): void {
  pendingImages.set(username, { imageUrl, sentAt: Date.now() });
}
 
export function popImageForUser(username: string): ImageCommand | null {
  const cmd = pendingImages.get(username);
  if (!cmd) return null;
  pendingImages.delete(username);
  return cmd;
}