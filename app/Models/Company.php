<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'logo',
        'is_active',
    ];

    /*
    |------------------------------------
    | USERS IN COMPANY
    |------------------------------------
    */
    public function users()
    {
        return $this->belongsToMany(User::class, 'company_user_roles')
            ->withPivot('role_id')
            ->withTimestamps();
    }

    /*
    |------------------------------------
    | CHECK USER EXISTS IN COMPANY
    |------------------------------------
    */
    public function hasUser($userId)
    {
        return $this->users()
            ->where('users.id', $userId)
            ->exists();
    }

    /*
    |------------------------------------
    | GET ALL ROLES IN THIS COMPANY
    | (via pivot table directly)
    |------------------------------------
    */
    public function roles()
    {
        return \DB::table('company_user_roles')
            ->join('roles', 'roles.id', '=', 'company_user_roles.role_id')
            ->where('company_user_roles.company_id', $this->id)
            ->select('roles.*')
            ->distinct()
            ->get();
    }

    /*
    |------------------------------------
    | ACTIVE USERS ONLY (optional)
    |------------------------------------
    */
    public function activeUsers()
    {
        return $this->users()->where('is_active', 1);
    }
}