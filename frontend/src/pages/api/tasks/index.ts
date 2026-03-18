export const prerender = false;

import { initTasksTable, getVisibleTasks, getTaskById } from "../../../lib/tasks";
import { hasCompetitionStarted } from "../../../lib/settings";

// GET /api/tasks — list all tasks
// GET /api/tasks?id=N — get a single task
export async function GET({ request }: { request: Request }) {
  await initTasksTable();
  if (!hasCompetitionStarted()) {
    return new Response(JSON.stringify({ error: "Competition has not started yet" }), { status: 403 });
  }

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");

  if (idParam) {
    const id = Number(idParam);
    if (!id) return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400 });
    const task = await getTaskById(id);
    if (!task || task.is_hidden) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify(task), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const tasks = await getVisibleTasks();
  return new Response(JSON.stringify(tasks), {
    headers: { "Content-Type": "application/json" },
  });
}