<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TaskStatus;

class TaskStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'To Do',
                'color' => '#6B7280', // gray
                'order' => 1,
            ],
            [
                'name' => 'In Progress',
                'color' => '#3B82F6', // blue
                'order' => 2,
            ],
            [
                'name' => 'Review',
                'color' => '#F59E0B', // yellow
                'order' => 3,
            ],
            [
                'name' => 'Completed',
                'color' => '#10B981', // green
                'order' => 4,
            ],
            [
                'name' => 'Blocked',
                'color' => '#EF4444', // red
                'order' => 5,
            ],
        ];

        foreach ($statuses as $status) {
            TaskStatus::firstOrCreate(
                ['name' => $status['name']],
                $status
            );
        }
    }
}