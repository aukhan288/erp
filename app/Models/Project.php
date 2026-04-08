<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
        'customer_id',
        'created_by',
    ];

     // Project belongs to a customer (optional)
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

     // Project has many milestones
    public function milestones()
    {
        return $this->hasMany(Milestone::class);
    }

    // Project has many tasks directly (optional, if not using milestones)
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Optional: Project has many sprints
    public function sprints()
    {
        return $this->hasMany(Sprint::class);
    }

    public function activities()
    {
        return $this->hasMany(ProjectActivity::class);
    }

// In Project.php
public function team()
{
    return $this->hasManyThrough(
        User::class,      // Final model
        Task::class,      // Intermediate model
        'project_id',     // Foreign key on Task table
        'id',             // Foreign key on User table (primary key of User)
        'id',             // Local key on Project table
        'assignee_id'     // Local key on Task table pointing to User
    )->distinct();       // Ensure unique users
}
}
