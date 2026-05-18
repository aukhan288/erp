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
    $companyId = auth()->user()->active_company_id;

$query = Task::with(['project', 'milestone', 'assignee', 'status', 'sprint', 'files'])
    ->whereNotNull('sprint_id')
    ->whereNotNull('assignee_id')
    ->whereHas('project', function ($q) use ($companyId) {
        $q->where('company_id', $companyId);
    })
    ->when(!auth()->user()->roles->contains('slug', 'admin'), function ($q) {
        $q->where('assignee_id', auth()->id());
    });

    if ($projectId) {
        $query->where('project_id', $projectId);
    }

    $tasks = $query
        ->orderBy('created_at', 'desc')
        ->paginate(10);

    return response()->json($tasks);
}
    // Show single task
    public function show(Task $task)
    {
        $task->load(['project', 'milestone', 'assignee', 'status','files']);
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
        'acceptance_criteria' => 'nullable|string',
        'description' => 'nullable|string',
        'status_id' => 'nullable|exists:task_statuses,id',
        'priority' => 'required|in:low,medium,high',
        'assignee_id' => 'nullable|exists:users,id',
        'reporter_id' => 'nullable|exists:users,id',
        'due_date' => 'nullable|date',
        'estimated_time' => 'nullable|integer|min:0',
    ]);

    $task = Task::create($validated);

    $files = $request->input('files', []);
    $files = array_map('intval', $files);

    if (!empty($files)) {
        $task->files()->sync($files);
    }

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
            'acceptance_criteria' => 'nullable|string',
            'description' => 'nullable|string',
            'status_id' => 'nullable|exists:task_statuses,id',
            'priority' => 'required|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'estimated_time' => 'nullable|integer|min:0',
        ]);

        $task->update($validated);
         $files = $request->input('files', []);
    $files = array_map('intval', $files);

    if (!empty($files)) {
        $task->files()->sync($files);
    }

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

 
    $pendingStatusId = TaskStatus::where('name', 'to do')->value('id');

    if ($task->assignee_id && $task->sprint_id && $task->status_id == null) {
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
    $companyId = auth()->user()->active_company_id;

    $todos = Task::with(['project', 'milestone', 'status'])
        ->where('assignee_id', $userId)
        ->where(function ($q) {
            $q->whereNull('status_id')
              ->orWhereNotIn('status_id', [4]);
        })
        ->whereHas('project', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })
        ->orderBy('due_date', 'asc')
        ->get();

    return response()->json($todos);
}

    public function markAsCompleted(Task $task)
    {
        $completedStatus = TaskStatus::where('name', 'completed')->first();

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
    // Backlog = sprint_id OR assignee_id null
    $backlogQuery = Task::query()
        ->where(function ($q) {
            $q->whereNull('sprint_id')
              ->orWhereNull('assignee_id')
              ->orWhereNull('status_id');
        });

    if ($project) {
        $backlogQuery->where('project_id', $project);
    }

    $backlogCount = $backlogQuery->count();

    // Status counts (only tasks fully assigned)
    $query = Task::query()
        ->join('task_statuses', 'tasks.status_id', '=', 'task_statuses.id')
        ->select('task_statuses.name')
        ->selectRaw('COUNT(*) as count')
        ->whereNotNull('tasks.sprint_id')
        ->whereNotNull('tasks.assignee_id')
        ->groupBy('task_statuses.name');

    if ($project) {
        $query->where('tasks.project_id', $project);
    }

    $counts = $query->pluck('count', 'name');

    $allStatuses = ['to do', 'in progress', 'completed', ];

    $statusCounts = [
        'backlog' => $backlogCount
    ];

    foreach ($allStatuses as $status) {
        $statusCounts[$status] = $counts[$status] ?? 0;
    }
  
    return response()->json($statusCounts);
}

  public function backlog($projectId = null)
{
    $query = Task::with(['milestone', 'assignee', 'status','sprint','files'])
        ->whereNull('sprint_id')
        ->whereNull('assignee_id');

    if ($projectId) {
        $query->where('project_id', $projectId);
    }

    $backlogTasks = $query->orderBy('created_at', 'asc')->get();

    return response()->json($backlogTasks);
}
  public function sprintBacklog($sprint=null)
{
    $query = Task::with(['milestone', 'assignee', 'status','sprint','files'])
        ->whereNull('assignee_id');


        $query->where('sprint_id', $sprint);

    $backlogTasks = $query->orderBy('created_at', 'asc')->get();

    return response()->json($backlogTasks);
}
}