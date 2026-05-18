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
        $adminRole = Role::firstWhere(['name' => 'admin']);
        $managerRole = Role::firstWhere(['name' => 'general_manager']);
        $employeeRole = Role::firstWhere(['name' => 'employee']);

        $defaultWorkingDays = [
            'monday' => 8,
            'tuesday' => 8,
            'wednesday' => 8,
            'thursday' => 8,
            'friday' => 8,
            'saturday' => 0,
            'sunday' => 0,
        ];

        // ---------- Admin ----------
        $adminUser = User::firstOrCreate(
            ['email' => 'ykretrofits@gmail.com'],
            [
                'firstname' => 'Yasir',
                'lastname' => 'Khan',
                'mobile' => '+923001112233',
                'cnic' => '12345-1234567-1',
                'address_line' => 'Karachi, Pakistan',
                'working_days' => $defaultWorkingDays,
                'email_verified_at' => now(),
                'password' => Hash::make('Admin12#'),
            ]
        );

        if ($adminRole) {
            $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        // ---------- Manager ----------
        $managerUser = User::firstOrCreate(
            ['email' => 'aiza.khalid@example.com'],
            [
                'firstname' => 'Aiza',
                'lastname' => 'Khalid',
                'mobile' => '+923004445566',
                'cnic' => '23456-2345678-2',
                'address_line' => 'Karachi, Pakistan',
                'working_days' => $defaultWorkingDays,
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
                'firstname' => 'Asadullah',
                'lastname' => 'Khan',
                'mobile' => '+923007778899',
                'cnic' => '34567-3456789-3',
                'address_line' => 'Karachi, Pakistan',
                'working_days' => $defaultWorkingDays,
                'email_verified_at' => now(),
                'password' => Hash::make('Employee12#'),
            ]
        );

        if ($employeeRole) {
            $employeeUser->roles()->syncWithoutDetaching([$employeeRole->id]);
        }
    }
}