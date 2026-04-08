<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SprintController;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class,'logout']);
    Route::get('/user', [AuthController::class,'user']);

    Route::post('/create-user', [UserController::class,'createUser'])->name('create-user');
    Route::get('/users', [UserController::class,'users'])->name('users');
    Route::get('/profile/{id}', [UserController::class, 'show']);
    Route::post('/toggle-permission', [UserController::class, 'togglePermission']);
    Route::post('/create-project', [ProjectController::class,'createProject'])->name('create-project');
    Route::get('/projects', [ProjectController::class,'projects'])->name('projects');
    Route::get('/project/{id}', [ProjectController::class, 'show']);
    Route::delete('/delete-project/{project}', [ProjectController::class, 'destroy'])->name('delete-project');

    Route::get('/milestones/{projectId?}', [MilestoneController::class, 'index']);
    Route::post('/create-milestone/{projectId}', [MilestoneController::class, 'createMilestone'])->name('create-milestone');
    Route::put('/milestones/{id}', [MilestoneController::class, 'updateMilestone']);
    Route::delete('delete-milestone/{id}', [MilestoneController::class, 'delete'])->name('delete-milestone');

    Route::get('/tasks/{projectId?}', [TaskController::class, 'index']);
    Route::post('/create-task/{projectId?}', [TaskController::class, 'create']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::put('/assign-task/{task}', [TaskController::class, 'assignTask'])->name('assign-task');
    Route::delete('/delete-task/{task}', [TaskController::class, 'destroy']);
    Route::get('/task/{task}', [TaskController::class, 'show']);
    Route::post('/task-completed/{task}', [TaskController::class, 'markAsCompleted'])->name('task-completed');
    Route::get('/tasks/status-count/{project?}', [TaskController::class, 'statusCounts']);
    Route::get('/backlog/{projectId?}', [TaskController::class, 'backlog']);

    Route::get('/task-statuses', [TaskController::class, 'taskStatuses']);
    Route::get('/todos/{userId}', [TaskController::class, 'todos']);
    Route::get('/project-activities/{project}', [ProjectController::class, 'activities'])
    ->name('project-activities');


    Route::get('/sprints/{projectId?}', [SprintController::class, 'index']);
    Route::post('/create-sprint/{projectId}', [SprintController::class, 'store']);
    Route::put('/sprints/{id}', [SprintController::class, 'update']);
    Route::delete('/sprints/{id}', [SprintController::class, 'destroy']);
    
});


Route::middleware(['auth:sanctum','role:admin|manager'])->group(function(){
    Route::get('/dashboard', [DashboardController::class,'index']);
});

Route::get('/debug', function (\Illuminate\Http\Request $request) {
    return [
        'cookies' => $request->cookies->all(),
        'user' => 'aa',
    ];
});

