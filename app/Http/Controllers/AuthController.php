<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

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
    try{
    $request->validate([
        'email'=>'required|email',
        'password'=>'required'
    ]);

    $user = User::where('email',$request->email)->with('roles', 'permissions')->first();

    // if(!$user || !Hash::check($request->password,$user->password)){
    //     return response()->json(['message'=>'Invalid credentials'],401);
    // }

    // create token
    $token = $user->createToken('erp-token')->plainTextToken;
    
    return response()->json([
        'user'=> $user,
        'token'=> $token
    ]);
   }catch(\Exception $e){
    dd($e->getMessage());
}
}

   public function logout(Request $request){
    $request->user()->currentAccessToken()->delete(); // delete token
    return response()->json(['message'=>'Logged out']);
}

    public function user(Request $request){
    
         return $request->user()->load('roles', 'permissions');
    }
}
