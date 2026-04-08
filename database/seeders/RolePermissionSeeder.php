<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

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

        // ---------- Assign Permissions to Roles ----------
        $adminRole->permissions()->sync(Permission::pluck('id')->toArray());
        $managerRole->permissions()->sync([$viewDashboard->id, $createInvoice->id]);
        $employeeRole->permissions()->sync([$viewDashboard->id]);

        // ---------- Users ----------
        $adminUser = User::firstOrCreate(
            ['email' => 'ykretrofits@gmail.com'],
            [
                'name' => 'Yasir Khan',
                'mobile' => '03001234567',
                'password' => Hash::make('Admin123#'),
            ]
        );
        $adminUser->roles()->sync([$adminRole->id]);

        $managerUser = User::firstOrCreate(
            ['email' => 'aiza.khalid@example.com'],
            [
                'name' => 'Aiza Khalid',
                'mobile' => '03007654321',
                'password' => Hash::make('Manager123#'),
            ]
        );
        $managerUser->roles()->sync([$managerRole->id]);

        $employeeUser = User::firstOrCreate(
            ['email' => 'aukhan288@gmail.com'],
            [
                'name' => 'Asadull Khan',
                'mobile' => '03009876543',
                'password' => Hash::make('Employee123#'),
            ]
        );
        $employeeUser->roles()->sync([$employeeRole->id]);
    }
}