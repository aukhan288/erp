<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- Roles ----------
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $managerRole = Role::firstOrCreate(['name' => 'general_manager']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        // ---------- Permissions ----------
        $viewDashboard = Permission::firstOrCreate(['name' => 'view_dashboard']);
        $createInvoice = Permission::firstOrCreate(['name' => 'create_invoice']);
        $approvePurchase = Permission::firstOrCreate(['name' => 'approve_purchase']);

        // ---------- Assign Permissions ----------
        $adminRole->permissions()->sync(Permission::pluck('id')->toArray());

        $managerRole->permissions()->sync([
            $viewDashboard->id,
            $createInvoice->id
        ]);

        $employeeRole->permissions()->sync([
            $viewDashboard->id
        ]);
    }
}