<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    // List all projects
public function projects(Request $request)
{
    $perPage = $request->input('per_page', 10);
    $companyId = auth()->user()->active_company_id;

    $projects = Project::query()
        ->where('company_id', $companyId)
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
            'company_id' => auth()->user()->active_company_id,
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
    $activities = $project->activities()
        ->with('user')
        ->latest()
        ->paginate(10);

    return response()->json($activities);
}

    public function downloadArtifacts(Project $project)
    {
        if (!$project->artifacts_url) {
            return response()->json([
                'message' => 'No artifact uploaded for this project'
            ], 404);
        }
        
        $disk = Storage::disk('public');

        if (!$disk->exists($project->artifacts_url)) {
            return response()->json([
                'message' => 'Artifact file not found in storage'
            ], 404);
        }

        return $disk->download($project->artifacts_url);
    }

    public function uploadArtifacts(Request $request, $projectId)
{
    $request->validate([
        'file' => 'nullable|file|mimes:zip|max:51200',
        'dropbox_url' => 'nullable|url'
    ]);

    // Prevent both
    if ($request->file && $request->dropbox_url) {
        return response()->json([
            'success' => false,
            'message' => 'Please upload ZIP OR provide Dropbox URL, not both.'
        ], 422);
    }

    // Prevent none
    if (!$request->file && !$request->dropbox_url) {
        return response()->json([
            'success' => false,
            'message' => 'Please upload ZIP or provide Dropbox URL.'
        ], 422);
    }

    $path = null;

    // ZIP Upload
    if ($request->hasFile('file')) {

        $file = $request->file('file');
        $fileName = time().'_'.$file->getClientOriginalName();

        $path = $file->storeAs('projects/'.$projectId.'/artifacts', $fileName, 'public');
    }

    // Dropbox URL
    if ($request->dropbox_url) {
        $path = $request->dropbox_url;
    }

    Project::where('id', $projectId)->update([
        'artifacts_url' => $path
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Artifact uploaded successfully',
        'path' => $path
    ]);
}
}