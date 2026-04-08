<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory;

    // Fillable fields for mass assignment
    protected $fillable = [
        'project_id',
        'name',
        'goal',
        'start_date',
        'end_date',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    /**
     * A sprint can have many milestones
     */

    public function milestones()
    {
        return $this->belongsToMany(Milestone::class, 'milestone_sprint')
                    ->withTimestamps()
                    ->withPivot('tasks_assigned'); // optional pivot field if you want to track how many tasks assigned from milestone
    }

    /**
     * A sprint can have many tasks directly (optional)
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Check if sprint is active
     */
    public function isActive(): bool
    {
        $today = now()->toDateString();
        return $today >= $this->start_date && $today <= $this->end_date;
    }
}