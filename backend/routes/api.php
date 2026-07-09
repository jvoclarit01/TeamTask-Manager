<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Employee list (For the assignment dropdown)
Route::get('/users',  [UserController::class, 'index']);

// Create & List all tasks (Admin)
Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{id}', [TaskController::class, 'update']);
Route::get('/tasks/{id}/comments', [TaskController::class, 'getComments']);
Route::post('/tasks/{id}/comments', [TaskController::class, 'addComment']);

// Tasks assigned to a specific user (Employee)
Route::get('/my-tasks/{userId}', [TaskController::class, 'getMyTasks']);

// Update task status (Employee)
Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);