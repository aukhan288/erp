<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- Roles ----------
        $adminRole = Role::firstWhere(['name' => 'admin']);
        $managerRole = Role::firstWhere(['name' => 'manager']);
        $employeeRole = Role::firstWhere(['name' => 'employee']);

        // ---------- Admin User ----------
        $adminUser = User::firstOrCreate(
            ['email' => 'yasirkhan@gmail.com'],
            [
                'name' => 'Yasir Khan',
                'avatar' => 'https://ui-avatars.com/api/?name=Yasir+Khan',
                'mobile' => '+923001112233',
                'cnic' => '12345-1234567-1',
                'address_line' => 'Karachi, Pakistan',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin12#'),
            ]
        );
        // attach role via custom pivot
        if ($adminRole) {
            $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        // ---------- General Manager ----------
        $managerUser = User::firstOrCreate(
            ['email' => 'aiza.khalid@example.com'],
            [
                'name' => 'Aiza Khalid',
                'avatar' => 'https://ui-avatars.com/api/?name=Aiza+Khalid',
                'mobile' => '+923004445566',
                'cnic' => '23456-2345678-2',
                'address_line' => 'Karachi, Pakistan',
                'email_verified_at' => now(),
                'password' => Hash::make('Manager12#'),
            ]
        );
        if ($managerRole) {
            $managerUser->roles()->syncWithoutDetaching([$managerRole->id]);
        }

        // ---------- Employee ----------
        $employeeUser = User::firstOrCreate(
            ['email' => 'aukhan288@gmail.com'],
            [
                'name' => 'Asadull Khan',
                'avatar' => 'https://ui-avatars.com/api/?name=Asadull+Khan',
                'mobile' => '+923007778899',
                'cnic' => '34567-3456789-3',
                'address_line' => 'Karachi, Pakistan',
                'email_verified_at' => now(),
                'password' => Hash::make('Employee12#'),
            ]
        );
        if ($employeeRole) {
            $employeeUser->roles()->syncWithoutDetaching([$employeeRole->id]);
        }
    }
}