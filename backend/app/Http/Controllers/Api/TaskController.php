<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // List all tasks (Admin)
    public function index()
    {
        return Task::with('users')->latest()->get();
    }

    // Create a new task (Admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'user_ids'    => 'required|array|min:1',
            'user_ids.*'  => 'exists:users,id',
            'priority'    => 'nullable|in:low,medium,high',
        ]);

        $task = Task::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date'    => $validated['due_date'] ?? null,
            'priority'    => $validated['priority'] ?? 'medium',
        ]);

        $task->users()->sync($validated['user_ids']);

        return response()->json($task->load('users'), 201);
    }

    // Update a task (Admin: full update; Employee: status only via PATCH)
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'user_ids'    => 'sometimes|array|min:1',
            'user_ids.*'  => 'exists:users,id',
            'priority'    => 'nullable|in:low,medium,high',
            'status'      => 'nullable|in:pending,in_progress,completed',
        ]);

        if (isset($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }

        $task->update([
            'title'       => $validated['title'] ?? $task->title,
            'description' => $validated['description'] ?? $task->description,
            'due_date'    => $validated['due_date'] ?? $task->due_date,
            'priority'    => $validated['priority'] ?? $task->priority,
            'status'      => $validated['status'] ?? $task->status,
        ]);

        return $task->load('users');
    }

    // Delete a task (Admin)
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }

    // Get tasks assigned to a specific user (Employee)
    public function getMyTasks(User $user)
    {
        return $user->tasks()->with('users')->latest()->get();
    }

    // Get comments for a task
    public function getComments(Task $task)
    {
        return $task->comments()->with('user')->latest()->get();
    }

    // Add a comment to a task
    public function addComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $comment = $task->comments()->create($validated);

        return response()->json($comment->load('user'), 201);
    }
}