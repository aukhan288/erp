<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;

use Illuminate\Support\Facades\DB;
use App\Models\CompanyDocument;

class CompanyController extends Controller
{
    /**
     * Get all companies of logged-in user
     */
    public function index()
    {
        $user = auth()->user();

        $companies = $user->companies;

        return response()->json([
            'companies' => $companies
        ]);
    }

    /**
     * Switch active company (Slack style)
     */
    public function switch(Request $request)
{
    $request->validate([
        'company_id' => 'required|exists:companies,id'
    ]);

    $user = auth()->user();

    // check user belongs to company
    $exists = DB::table('company_user_roles')
        ->where('user_id', $user->id)
        ->where('company_id', $request->company_id)
        ->exists();

    if (!$exists) {
        return response()->json([
            'message' => 'You are not allowed to access this company'
        ], 403);
    }

    // ✅ UPDATE DATABASE (THIS WAS MISSING)
    $user->active_company_id = $request->company_id;
    $user->save();

    // ✅ UPDATE SESSION
    session(['company_id' => $request->company_id]);

    // roles
    $roles = DB::table('company_user_roles')
        ->join('roles', 'roles.id', '=', 'company_user_roles.role_id')
        ->where('company_user_roles.user_id', $user->id)
        ->where('company_user_roles.company_id', $request->company_id)
        ->select('roles.id', 'roles.name')
        ->get();

    $company = DB::table('companies')
        ->where('id', $request->company_id)
        ->first();

    return response()->json([
        'message' => 'Company switched successfully',
        'company' => $company,
        'company_id' => $request->company_id,
        'roles' => $roles
    ]);
}
    /**
     * Get current active company
     */
    public function current()
    {
        $companyId = session('company_id');

        if (!$companyId) {
            return response()->json([
                'message' => 'No company selected'
            ], 400);
        }

        $company = Company::find($companyId);

        return response()->json([
            'company' => $company
        ]);
    }

    /**
     * Assign user to company with role (admin use)
     */
    public function assignUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        // prevent duplicates
        $exists = DB::table('company_user_roles')
            ->where('user_id', $request->user_id)
            ->where('company_id', $request->company_id)
            ->where('role_id', $request->role_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'User already assigned with this role'
            ]);
        }

        DB::table('company_user_roles')->insert([
            'user_id' => $request->user_id,
            'company_id' => $request->company_id,
            'role_id' => $request->role_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'User assigned successfully'
        ]);
    }


    public function documents(Request $request)
    {
        $companyId = auth()->user()->active_company_id;

        $query = CompanyDocument::with('file')
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc');

        $perPage = $request->per_page ?? 10;

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function storeDocument(Request $request)
    {
        $companyId = auth()->user()->active_company_id;

        $request->validate([
            'file_id' => 'required|exists:files,id',
            'title' => 'required|string|max:255',
            'category' => 'nullable|string',
            'document_number' => 'nullable|string',
            'expiry_type' => 'required|in:none,fixed,yearly,monthly',
            'issued_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'reminder_days' => 'nullable|integer',
        ]);

        $doc = CompanyDocument::create([
            'company_id' => $companyId,
            'file_id' => $request->file_id,
            'title' => $request->title,
            'category' => $request->category,
            'document_number' => $request->document_number,
            'expiry_type' => $request->expiry_type,
            'issued_date' => $request->issued_date,
            'expiry_date' => $request->expiry_date,
            'reminder_days' => $request->reminder_days ?? 30,
            'status' => $this->calculateStatus($request->expiry_date),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Document created successfully',
            'data' => $doc->load('file')
        ]);
    }
    
    public function updateDocument(Request $request, $id)
    {
        $companyId = auth()->user()->active_company_id;

        $doc = CompanyDocument::where('company_id', $companyId)
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'file_id' => 'required|exists:documents,id',
            'title' => 'required|string|max:255',
            'category' => 'nullable|string',
            'document_number' => 'nullable|string',
            'expiry_type' => 'required|in:none,fixed,yearly,monthly',
            'issued_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'reminder_days' => 'nullable|integer',
        ]);

        $doc->update([
            'file_id' => $request->file_id,
            'title' => $request->title,
            'category' => $request->category,
            'document_number' => $request->document_number,
            'expiry_type' => $request->expiry_type,
            'issued_date' => $request->issued_date,
            'expiry_date' => $request->expiry_date,
            'reminder_days' => $request->reminder_days ?? 30,
            'status' => $this->calculateStatus($request->expiry_date),
        ]);

        return response()->json([
            'message' => 'Document updated successfully',
            'data' => $doc->load('file')
        ]);
    }

    public function deleteDocument($id)
    {
        $companyId = auth()->user()->active_company_id;

        $doc = CompanyDocument::where('company_id', $companyId)
            ->where('id', $id)
            ->firstOrFail();

        $doc->delete();

        return response()->json([
            'message' => 'Document deleted successfully'
        ]);
    }

    private function calculateStatus($expiryDate)
    {
        if (!$expiryDate) return 'active';

        if (now()->gt($expiryDate)) {
            return 'expired';
        }

        if (now()->diffInDays($expiryDate) <= 30) {
            return 'expiring';
        }

        return 'active';
    }
}