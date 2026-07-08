<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;   

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        // 2. Create Admin Users
        $admin = User::firstOrCreate([
            'email' => 'admin@company.com',
        ], [
            'name' => 'Alice Admin',
            'password' => bcrypt('password123'),
        ]);
        $admin->assignRole($adminRole);

        // 3. Create Employee Users
        $employee1 = User::firstOrCreate([
            'email' => 'bob@company.com',
        ], [
            'name' => 'Bob Employee',
            'password' => bcrypt('password123'),
        ]);
        $employee1->assignRole($employeeRole);

        $employee2 = User::firstOrCreate([
            'email' => 'charlie@company.com',
        ], [
            'name' => 'Charlie Employee',
            'password' => bcrypt('password123'),
        ]);
        $employee2->assignRole($employeeRole);

        $employee3 = User::firstOrCreate([
            'email' => 'diana@company.com',
        ], [
            'name' => 'Diana Employee',
            'password' => bcrypt('password123'),
        ]);
        $employee3->assignRole($employeeRole);
    }
}
