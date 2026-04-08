<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // List all projects
public function projects(Request $request)
{
    $perPage = $request->input('per_page', 10);

    $projects = Project::query()
        ->when($request->input('search'), function ($q) use ($request) {
            $q->where('name', 'like', "%{$request->input('search')}%");
        })
        ->latest()
        ->paginate($perPage);

    return response()->json($projects);
}

    // Show single project
    public function show($id)
    {
        $project = Project::with('team')->findOrFail($id);
        return response()->json($project);
    }

    // Create new project
    public function createProject(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'customer_id' => 'nullable|exists:customers,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string',
        ]);

        $project = Project::create([
            'name' => $request->name,
            'description' => $request->description,
            'customer_id' => $request->customer_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status ?? 'active',
            'created_by' => auth()->id(),
        ]);

        projectActivity(
            $project->id,
            'added_project',
            'Project "' . $project->name . '" was created'
        );

        return response()->json($project, 201);
    }

    // Update project
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'customer_id' => 'nullable|exists:customers,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string',
        ]);

        $project->update($request->all());

        return response()->json($project);
    }

    // Delete project
    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function activities(Project $project)
    {
        $activities = $project->activities()->with('user')->latest()->get();

        return response()->json([
            'data' => $activities
        ]);
    }
}