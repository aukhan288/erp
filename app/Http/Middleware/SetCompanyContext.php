<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Company;

class SetCompanyContext
{
    public function handle(Request $request, Closure $next)
    {
        // if no company selected
        if (!session()->has('company_id')) {
            return response()->json([
                'message' => 'No company selected'
            ], 403);
        }

        $companyId = session('company_id');

        $company = Company::find($companyId);

        // invalid company
        if (!$company) {
            session()->forget('company_id');
            return response()->json([
                'message' => 'Invalid company'
            ], 403);
        }

        // attach globally (optional helper)
        app()->instance('current_company', $company);

        return $next($request);
    }
}