<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SprintController extends Controller
{
    // List all sprints (optionally for a project)
public function index($projectId = null)
{
    $companyId = auth()->user()->active_company_id;

    $query = Sprint::with(['project', 'tasks.assignee'])
        ->whereHas('project', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        });

    if ($projectId) {
        $query->where('project_id', $projectId);
        $sprints = $query->get();
    } else {
        $sprints = $query->paginate(10);
    }

    return response()->json(['data' => $sprints]);
}

    // Create a sprint
    public function store(Request $request, $projectId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $sprint = Sprint::create([
            'name' => $request->name,
            'goal' => $request->goal,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'project_id' => $projectId,
        ]);

        return response()->json($sprint);
    }

    // Update sprint
    public function update(Request $request, $id)
    {
        $sprint = Sprint::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $sprint->update($request->only(['name','goal','start_date','end_date']));

        return response()->json($sprint);
    }

    // Delete sprint
    public function destroy($id)
    {
        $sprint = Sprint::findOrFail($id);
        $sprint->delete();

        return response()->json(['message' => 'Sprint deleted']);
    }



public function getSprintUsers($id)
{
    $sprint = Sprint::findOrFail($id);

    $users = User::join('sprint_users', 'users.id', '=', 'sprint_users.user_id')
                  ->where('sprint_users.sprint_id', $id)
                  ->select('users.*')
                  ->get();

    $taskTimes = Task::where(function ($q) {
            $q->where('status_id', '!=', 4)
              ->orWhereNull('status_id');
        })
        ->selectRaw('assignee_id, SUM(estimated_time) as total_minutes')
        ->groupBy('assignee_id')
        ->pluck('total_minutes', 'assignee_id');

    $startBase = Carbon::parse($sprint->start_date);
    $endBase   = Carbon::parse($sprint->end_date);

    return response()->json([
        'data' => $users->map(function ($user) use ($taskTimes, $startBase, $endBase) {

            $workingDays = $user->working_days ?? [];

            // normalize working days safely
            $normalized = [];

            foreach ($workingDays as $day => $hours) {
                $day = strtolower(trim($day));
                $normalized[$day] = (float) trim($hours);
            }

            $totalMinutes = 0;
            $date = $startBase->copy();

            // calculate exact sprint capacity day by day
            while ($date->lte($endBase)) {

                $day = strtolower($date->format('l'));

                $hours = $normalized[$day] ?? 0;

                $totalMinutes += $hours * 60;

                $date->addDay();
            }

            $allocatedMinutes = (int) ($taskTimes[$user->id] ?? 0);

            return [
                'id' => $user->id,
                'name' => $user->firstname . ' ' . $user->lastname,
                'avatar_url' => $user->avatar_url,
                'sprint_capacity_minutes' => (int) round($totalMinutes),
                'allocated_minutes' => $allocatedMinutes,
                'remaining_minutes' => (int) round($totalMinutes - $allocatedMinutes),
            ];
        })
    ]);
}
public function toggleSprintUser(Request $request, $sprintId)
{
    $request->validate([
        'user_id' => 'required|exists:users,id',
    ]);

    $sprint = Sprint::findOrFail($sprintId);

    // check if already assigned
    $exists = $sprint->users()->where('user_id', $request->user_id)->exists();

    if ($exists) {
        // REMOVE USER
        $sprint->users()->detach($request->user_id);

        return response()->json([
            'message' => 'User removed from sprint',
            'action' => 'removed'
        ]);
    } else {
        // ADD USER
        $sprint->users()->attach($request->user_id);

        return response()->json([
            'message' => 'User added to sprint',
            'action' => 'added'
        ]);
    }
}
}