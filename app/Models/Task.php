<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'milestone_id',
        'sprint_id',
        'title',
        'description',
        'status_id',
        'priority',
        'assignee_id',
        'reporter_id',
        'due_date',
        'completed_at',
    ];

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }

    public function status()
    {
        return $this->belongsTo(TaskStatus::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }
}