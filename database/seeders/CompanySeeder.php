<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use Illuminate\Support\Str;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            [
                'name' => 'Lamtans Engineering Ltd',
                'email' => 'info@lamtansengineering.com',
                'phone' => null,
                'address' => null,
                'logo' => null,
            ],
            [
                'name' => 'Lamtans Research Ltd',
                'email' => 'info@lamtansresearch.com',
                'phone' => null,
                'address' => null,
                'logo' => null,
            ],
            [
                'name' => 'Lamtans Technology',
                'email' => 'info@lamtanstechnology.com',
                'phone' => null,
                'address' => null,
                'logo' => null,
            ],
        ];

        foreach ($companies as $company) {
            Company::create([
                'name' => $company['name'],
                'slug' => Str::slug($company['name']),
                'email' => $company['email'],
                'phone' => $company['phone'],
                'address' => $company['address'],
                'logo' => $company['logo'],
                'is_active' => true,
            ]);
        }
    }
}