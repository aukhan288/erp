<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskStatus;

class TaskController extends Controller
{
    // List all tasks
    public function index($projectId = null)
    {
        // Start query with relationships
        $query = Task::with(['project', 'milestone', 'assignee', 'status', 'sprint']);

        // Filter by project if provided
        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        // Execute query
        $tasks = $projectId ? $query->get() : $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($tasks);
    }

    // Show single task
    public function show(Task $task)
    {
        $task->load(['project', 'milestone', 'assignee', 'status']);
        return response()->json($task);
    }

    // Create task
    public function create(Request $request)
    {
       $request->merge([
        'status_id' => $request->status_id ?? TaskStatus::where('name', 'backlog')->value('id')
    ]);

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'milestone_id' => 'nullable|exists:milestones,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status_id' => 'nullable|exists:task_statuses,id',
            'priority' => 'required|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);
    
        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    // Update task
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'milestone_id' => 'nullable|exists:milestones,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status_id' => 'required|exists:task_statuses,id',
            'priority' => 'required|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    // Delete task
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted']);        
    }

   public function taskStatuses(Request $request)
    {
        return response()->json(TaskStatus::all());
    }
    
   public function assignTask(Request $request, Task $task)
{
    $request->validate([
        'assignee_id' => 'nullable|exists:users,id', // null = unassigned
        'sprint_id'   => 'nullable|exists:sprints,id', // optional sprint update
    ]);

    // Update assignee if provided
    if ($request->has('assignee_id')) {
        $task->assignee_id = $request->assignee_id;
    }

    // Update sprint if provided
    if ($request->has('sprint_id')) {
        $task->sprint_id = $request->sprint_id;
    }

    // Auto-change status: backlog → pending
    $backlogStatusId = TaskStatus::where('name', 'backlog')->value('id');
    $pendingStatusId = TaskStatus::where('name', 'pending')->value('id');

    if ($task->assignee_id && $task->sprint_id && $task->status_id == $backlogStatusId) {
        $task->status_id = $pendingStatusId;
    }

    $task->save();

    return response()->json([
        'message' => 'Task updated successfully',
        'task' => $task->load('assignee')
    ]);
}

    public function todos($userId)
    {
        $todos = Task::with('project', 'milestone', 'status')
            ->where('assignee_id', $userId)
            ->whereIn('status_id', [1]) // Assuming 1 = To Do, 2 = In Progress
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json($todos);
    }

    public function markAsCompleted(Task $task)
    {
        $completedStatus = TaskStatus::where('name', 'Completed')->first();

        if (!$completedStatus) {
            return response()->json(['message' => 'Completed status not found'], 500);
        }

        $task->status_id = $completedStatus->id;
        $task->completed_at = now();
        $task->save();

        return response()->json([
            'message' => 'Task marked as completed',
            'task' => $task->load('status') // return updated task with status
        ]);
    }

    
    public function statusCounts($project = null)
{
    $query = Task::query()
        ->join('task_statuses', 'tasks.status_id', '=', 'task_statuses.id')
        ->select('task_statuses.name')
        ->selectRaw('COUNT(*) as count')
        ->groupBy('task_statuses.name');

    if ($project) {
        $query->where('tasks.project_id', $project);
    }

    $counts = $query->pluck('count', 'name'); // ['Backlog' => 12, ...]

    // Ensure all statuses are present even if count is 0
    $allStatuses = ['backlog', 'pending', 'in progress', 'completed', 'Blocked'];
    $statusCounts = [];
    foreach ($allStatuses as $status) {
        $statusCounts[$status] = $counts[$status] ?? 0;
    }

    return response()->json($statusCounts);
}

  public function backlog($projectId = null)
{
    $query = Task::with(['milestone', 'assignee', 'status','sprint'])
        ->whereNull('sprint_id')
        ->orWhereNull('assignee_id');

    if ($projectId) {
        $query->where('project_id', $projectId);
    }

    $backlogTasks = $query->orderBy('created_at', 'asc')->get();

    return response()->json($backlogTasks);
}
}