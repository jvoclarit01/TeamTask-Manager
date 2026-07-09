<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTaskRequest;
use App\Http\Requests\Api\UpdateTaskStatusRequest;
use App\Models\Task;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Retrieve all tasks with assigned employees (for Admin Dashboard)
    public function index(): JsonResponse {
        $tasks = Task::with('users:id,name')->latest()->get();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'status' => 'pending',
            'priority' => $request->input('priority', 'medium'),
        ]);

        $task->users()->sync($validated['user_ids']);

        return response()->json($task->load('users'), 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|string|in:pending,in_progress,completed',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'status' => $validated['status'] ?? $task->status,
            'priority' => $request->input('priority', 'medium'),
        ]);

        $task->users()->sync($validated['user_ids']);

        return response()->json($task->load('users'), 200);
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

    public function getComments($id)
    {
        $comments = Comment::with('user')
            ->where('task_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($comments);
    }

    public function addComment(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $comment = Comment::create([
            'task_id' => $id,
            'user_id' => $request->input('user_id'),
            'content' => $request->input('content'),
        ]);

        return response()->json($comment->load('user'), 201);
    }
}
