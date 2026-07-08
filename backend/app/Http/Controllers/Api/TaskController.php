<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTaskRequest;
use App\Http\Requests\Api\UpdateTaskStatusRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    // Retrieve all tasks with assigned employees (for Admin Dashboard)
    public function index(): JsonResponse {
        $tasks = Task::with('users:id,name')->latest()->get();
        return response()->json($tasks);
    }

    // Create a new task and sync with user IDs
    public function store(StoreTaskRequest $request): JsonResponse {
        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        // Sync pivot table: task_user
        $task->users()->sync($request->user_ids);

        return response()->json($task->load('users:id,name'), 201);
    }

    // Fetch tasks assigned to a specific user (for Employee View)
    public function getMyTasks($userId): JsonResponse {
        $user = User::findOrFail($userId);
        $tasks = $user->tasks()->with('users:id,name')->latest()->get();

        return response()->json($tasks);
    }

    // Update status of a task
    public function updateStatus(UpdateTaskStatusRequest $request, $id):JsonResponse {
        $task = Task::findOrFail($id);
        $task->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Task status updated succesfully',
            'task' => $task->load('users:id,name')
        ]);
    }
}
