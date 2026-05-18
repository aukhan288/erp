<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Company;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'required|email|unique:users',
            'password'=>'required|string|min:6|confirmed',
            'role'=>'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name'=>$request->name,
            'email'=>$request->email,
            'password'=>Hash::make($request->password)
        ]);

        $user->assignRole($request->role);

        return response()->json(['message'=>'User registered'],201);
    }

    public function login(Request $request)
{
    try {
        Log::info('Login attempt started', [
            'email' => $request->email,
            'ip' => $request->ip(),
        ]);

        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)
            ->with('roles', 'permissions', 'companies:id,name', 'activeCompany:id,name')
            ->first();

        if (!$user) {
            Log::warning('Login failed - user not found', [
                'email' => $request->email
            ]);

            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            Log::warning('Login failed - wrong password', [
                'email' => $request->email,
                'user_id' => $user->id
            ]);

            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Log::info('Login successful', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        $token = $user->createToken('erp-token')->plainTextToken;

        Log::info('Token generated', [
            'user_id' => $user->id
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);

    } catch (\Exception $e) {
        Log::error('Login exception occurred', [
            'message' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile(),
        ]);

        return response()->json([
            'message' => 'Server error'
        ], 500);
    }
}

   public function logout(Request $request){
    $request->user()->currentAccessToken()->delete(); // delete token
    return response()->json(['message'=>'Logged out']);
}

   public function user(Request $request, $id = null)
{
    $user = $id
        ? User::findOrFail($id)
        : $request->user();

    $user->load([
        'permissions',
        'activeCompany',
        'roles',
        'companies:id,name'
    ]);

    // filter roles manually per active company
    $user->setRelation(
        'roles',
        $user->roles
            ->where('pivot.company_id', $user->active_company_id)
            ->values()
    );

    // get all companies with flag
    $allCompanies = Company::select('id', 'name')->get();

    $userCompanyIds = $user->companies->pluck('id');

    $companies = $allCompanies->map(function ($company) use ($userCompanyIds) {
        return [
            'id' => $company->id,
            'name' => $company->name,
            'selected' => $userCompanyIds->contains($company->id)
        ];
    });

    $user->setRelation('companies', $companies);

    return $user;
}
}
