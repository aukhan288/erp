<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'description',
        'due_date',
        'status',
    ];

    public function sprints()
    {
        return $this->belongsToMany(Sprint::class, 'milestone_sprint')
                    ->withTimestamps()
                    ->withPivot('tasks_assigned');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'milestone_id', 'id');
    }
}
