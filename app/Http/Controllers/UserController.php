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
        $validatedData = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'mobile' => 'required|string',
            'cnic' => 'required|string',
            'working_days' => 'required|array',
            'address' => 'required|string',
        ]);

        $user = User::create([
            'firstname' => $validatedData['firstname'],
            'lastname' => $validatedData['lastname'] ?? null,
            'email' => $validatedData['email'],
            'mobile' => $validatedData['mobile'],
            'cnic' => $validatedData['cnic'],
            'working_days' => $validatedData['working_days'],
            'address_line' => $validatedData['address'],
            'password' => Hash::make('Admin12#'),
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

public function users(Request $request)
{
    $perPage = $request->input('per_page', 10);



    $users = User::query()
        ->with([
            'roles:id,name',
            'permissions:id,name',
            'companies:id,name',
            'activeCompany:id,name'
        ])
        ->when($request->search, function ($q) use ($request) {
            $q->where(function ($query) use ($request) {
                $query->where('firstname', 'like', "%{$request->search}%")
                      ->orWhere('lastname', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
            });
        })
        ->withCount([
            'tasks as assigned_tasks' => function ($q) {
                $q->whereNotIn('status_id', [2, 3]);
            },
            'tasks as completed_tasks' => function ($q) {
                $q->whereIn('status_id', [4]);
            }
        ])
        ->latest()
        ->paginate($perPage);

    return response()->json($users);
}

   public function show($id)
{
    $user = User::with([
        'permissions',
        'companies:id,name',
        'activeCompany:id,name',
        'roles.permissions'
    ])->findOrFail($id);

    $user->setRelation(
        'roles',
        $user->roles->where('pivot.company_id', $user->active_company_id)
    );

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

    public function uploadAvatar(Request $request)
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    $user = auth()->user();

    if ($request->hasFile('avatar')) {

        $file = $request->file('avatar');

        $path = $file->store('avatars', 'public');

        $user->avatar =   $path;
        $user->save();
    }

    return response()->json([
        'message' => 'Avatar uploaded successfully',
        'avatar_url' => $user->avatar_url
    ]);
}
}
