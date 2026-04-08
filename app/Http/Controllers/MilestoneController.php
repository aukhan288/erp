<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Milestone;

class MilestoneController extends Controller
{
    // GET /milestones/{projectId?}
    public function index($projectId = null)
    {
        $query = Milestone::query();

        // Filter by project if provided
        $projectId? $query->where('project_id', $projectId)->with(['tasks.assignee']) : $query->with(['project', 'tasks.assignee']);
        

        $milestones = $query->latest()->get();

        return response()->json([
            'data' => $milestones
        ]);
    }

    // POST /create-milestone/{projectId}
    public function createMilestone(Request $request, $projectId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'required|string'
        ]);

        $milestone = Milestone::create([
            'project_id' => $projectId,
            'name' => $request->name,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'status' => $request->status
        ]);

        projectActivity(
            $milestone->project_id,
            'added_milestone',
            'Milestone "' . $milestone->name . '" was created'
        );


        return response()->json([
            'message' => 'Milestone created successfully',
            'data' => $milestone
        ], 201);
    }


public function updateMilestone(Request $request, $id)
{
    $milestone = Milestone::findOrFail($id);

    $data = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'due_date' => 'nullable|date',
        'status' => 'required|string|in:pending,in_progress,completed',
    ]);

    $milestone->update($data);

    return response()->json($milestone);
}

    // Delete a milestone
    public function delete($id)
    {
        $milestone = Milestone::findOrFail($id);
        $milestone->delete();

        return response()->json(['message' => 'Milestone deleted successfully']);
    }
}