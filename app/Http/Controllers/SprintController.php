<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    // List all sprints (optionally for a project)
    public function index($projectId = null)
    {
        $sprints = $projectId 
            ? Sprint::with(['project', 'tasks.assignee'])->where('project_id', $projectId)->get()
            : Sprint::with(['project', 'tasks.assignee'])->paginate(10);

        return response()->json(['data' => $sprints]);
    }

    // Create a sprint
    public function store(Request $request, $projectId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
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
}