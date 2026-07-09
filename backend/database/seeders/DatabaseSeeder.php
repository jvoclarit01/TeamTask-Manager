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
            'name' => 'Admin',
            'password' => bcrypt('password123'),
        ]);
        $admin->assignRole($adminRole);

        // 3. Create Employee Users
        $employee = User::firstOrCreate([
            'email' => 'yoshiem@gmail.com',
        ], [
            'name' => 'Yosh Batula',
            'password' => bcrypt('password123'),
        ]);
        $employee->assignRole($employeeRole);
    }
}
