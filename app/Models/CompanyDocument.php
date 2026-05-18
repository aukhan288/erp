<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyDocument extends Model
{
    protected $fillable = [
        'company_id',
        'file_id',
        'title',
        'category',
        'document_number',
        'issued_date',
        'expiry_date',
        'expiry_type',
        'reminder_days',
        'status',
        'created_by',
    ];

    /*
    |----------------------------------------------------
    | Relationships
    |----------------------------------------------------
    */

    public function file()
    {
        return $this->belongsTo(File::class, 'file_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /*
    |----------------------------------------------------
    | Scopes (VERY useful for ERP filters)
    |----------------------------------------------------
    */

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpiring($query)
    {
        return $query->where('status', 'expiring');
    }
}