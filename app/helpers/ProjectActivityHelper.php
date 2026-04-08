<?php

use App\Models\ProjectActivity;
use Illuminate\Support\Facades\Auth;

if (!function_exists('projectActivity')) {
    /**
     * Log an activity for a project
     *
     * @param int $projectId
     * @param string $action
     * @param string|null $description
     */
    function projectActivity($projectId, $action, $description = null)
    {
        ProjectActivity::create([
            'project_id' => $projectId,
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description
        ]);
    }
}