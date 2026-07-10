<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\StoreTaskRequest;
use App\Http\Requests\Api\UpdateTaskRequest;
use App\Http\Requests\Api\StoreCommentRequest;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    // List all tasks (Admin fetches all, Employee fetches their own)
    public function index(Request $request)
    {
        if ($request->user()->hasRole('admin')) {
            return Task::with('users')->latest()->get();
        }

        return $request->user()->tasks()->with('users')->latest()->get();
    }

    // Create a new task (Admin only)
    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();

        $task = DB::transaction(function () use ($validated) {
            $task = Task::create([
                'title'       => $validated['title'],
                'description' => $validated['description'] ?? null,
                'due_date'    => $validated['due_date'] ?? null,
                'priority'    => $validated['priority'] ?? 'medium',
            ]);

            $task->users()->sync($validated['user_ids']);
            return $task;
        });

        return response()->json($task->load('users'), 201);
    }

    // Update a task (Admin: full update; Employee: status only)
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $user = $request->user();

        if ($user->hasRole('employee')) {
            // Ensure employee is assigned to this task
            if (!$task->users()->where('users.id', $user->id)->exists()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $validated = $request->validated();

            $task->update(['status' => $validated['status']]);
            return $task->load('users');
        }

        if ($user->hasRole('admin')) {
            // Admin full update
            $validated = $request->validated();

            DB::transaction(function () use ($task, $validated) {
                if (isset($validated['user_ids'])) {
                    $task->users()->sync($validated['user_ids']);
                }

                $updateData = [];
                foreach (['title', 'description', 'due_date', 'priority', 'status'] as $field) {
                    if (array_key_exists($field, $validated)) {
                        $updateData[$field] = $validated[$field];
                    }
                }
                $task->update($updateData);
            });

            return $task->load('users');
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }
    }

    // Delete a task (Admin)
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }

    // Get tasks assigned to a specific user (Secured access scope)
    public function getMyTasks(Request $request, User $user)
    {
        if ($request->user()->id !== $user->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $user->tasks()->with('users')->latest()->get();
    }

    // Get comments for a task
    public function getComments(Request $request, Task $task)
    {
        $user = $request->user();

        // Ensure user is admin OR is assigned to this task
        if (!$user->hasRole('admin') && !$task->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $task->comments()->with('user')->latest()->get();
    }

    // Add a comment to a task
    public function addComment(StoreCommentRequest $request, Task $task)
    {
        $user = $request->user();

        // Ensure user is admin OR is assigned to this task
        if (!$user->hasRole('admin') && !$task->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validated();

        $comment = $task->comments()->create([
            'user_id' => $user->id,
            'content' => $validated['content'],
        ]);

        return response()->json($comment->load('user'), 201);
    }
}