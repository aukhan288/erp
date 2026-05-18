<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
protected $fillable = [
        'name',
        'original_name',
        'path',
        'url',
        'mime_type',
        'size',
        'uploaded_by',
        'fileable_id',
        'fileable_type',
    ];


    protected $appends = ['full_url'];

    // Optional: if you store relative path
    public function getFullUrlAttribute()
    {
        return $this->url ?? asset('storage/' . $this->path);
    }

    // Polymorphic relation (BEST for tasks, projects, etc.)
    public function fileable()
    {
        return $this->morphTo();
    }

    // Optional: uploader relation
    public function user()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}