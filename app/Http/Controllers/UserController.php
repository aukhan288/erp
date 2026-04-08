<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function createUser(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
        ]);

        // Create a new user using the validated data
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make('Admin12#'),
        ]);

        // Return a response indicating success
        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

   public function users(Request $request)
{
    $perPage = $request->input('per_page', 10);

    $users = User::query()
        ->with('roles', 'permissions')
        ->when($request->search, function ($q) use ($request) {
            $q->where(function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
            });
        })
        ->withCount([
            'tasks as assigned_tasks' => function ($q) {
                $q->whereNotIn('status_id', [2, 3]); // exclude rejected
                // exclude rejected
            },
            'tasks as completed_tasks' => function ($q) {
                $q->whereIn('status_id', [4]); // completed
            }
        ])
        ->latest()
        ->paginate($perPage);

    return response()->json($users);
}

   public function show($id)
{
    $user = User::with('roles.permissions', 'permissions')->findOrFail($id);

    // Merge direct permissions + role permissions
    $rolePermissions = $user->roles->flatMap(function ($role) {
        return $role->permissions;
    });

   $allPermissions = Permission::all()->unique('name')->values();

    return response()->json([
        'user' => $user,
        'permissions' => $allPermissions
    ]);
}

    public function togglePermission(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission_id' => 'required|exists:permissions,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $permissionId = $request->permission_id;

        if ($user->permissions()->where('permission_id', $permissionId)->exists()) {
            // Permission exists, so detach it
            $user->permissions()->detach($permissionId);
            return response()->json(['message' => 'Permission revoked successfully']);
        } else {
            // Permission does not exist, so attach it
            $user->permissions()->attach($permissionId);
            return response()->json(['message' => 'Permission granted successfully']);
        }
    }
}
