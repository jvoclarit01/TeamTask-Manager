<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add priority to tasks table
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('priority')->default('medium')->nullable()->after('due_date');
        });

        // Create comments table
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('priority');
        });
    }
};
