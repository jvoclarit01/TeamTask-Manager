<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Enum;
use App\Enums\AvailabilityStatus;
use App\Http\Requests\Api\StoreUserRequest;
use App\Http\Requests\Api\UpdateUserStatusRequest;
use App\Http\Requests\Api\AdminUpdateUserRequest;

class UserController extends Controller {
    public function index(Request $request): JsonResponse {
        $query = User::role('employee')->with(['tasks' => function ($q) {
            $q->select('tasks.id', 'tasks.title', 'tasks.status', 'tasks.priority');
        }]);

        if (!$request->user()->hasRole('admin')) {
            $query->where('is_active', true);
        }

        $employees = $query->get(['id', 'name', 'email', 'is_active', 'availability_status', 'skills']);
        return response()->json($employees);
    }

    public function store(StoreUserRequest $request): JsonResponse {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(\Illuminate\Support\Str::random(40)),
        ]);

        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $validated['role'],
            ]
        ], 201);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse {
        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

        $user->availability_status = $validated['availability_status'];
        $user->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'availability_status' => $user->availability_status
        ]);
    }

    public function adminUpdate(AdminUpdateUserRequest $request, User $user): JsonResponse {
        $validated = $request->validated();

        if ($request->user()->id === $user->id && isset($validated['is_active']) && !$validated['is_active']) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 403);
        }

        if (isset($validated['is_active'])) {
            $user->is_active = $validated['is_active'];
        }
        if (isset($validated['is_active']) && !$validated['is_active']) {
            $user->tokens()->delete();
            // Detach from incomplete tasks
            $user->tasks()->where('status', '!=', 'completed')->detach();
        }
        if (isset($validated['skills'])) {
            $user->skills = $validated['skills'];
        }

        $user->save();

        return response()->json([
            'message' => 'Employee details updated successfully',
            'user' => [
                'id' => $user->id,
                'is_active' => $user->is_active,
                'skills' => $user->skills
            ]
        ]);
    }
}
