<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Employee list (For the assignment dropdown)
    Route::get('/users',  [UserController::class, 'index']);

    // Tasks (Admin-only creation & deletion)
    Route::middleware('role:admin')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });

    // Task actions available to authenticated users (individual logic handled in controller)
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::patch('/tasks/{task}', [TaskController::class, 'update']); // Keep patch for status updates

    // Nested comments on tasks
    Route::get('/tasks/{task}/comments', [TaskController::class, 'getComments']);
    Route::post('/tasks/{task}/comments', [TaskController::class, 'addComment']);

    // Tasks for a specific user (Employee) - nested resource
    Route::get('/users/{user}/tasks', [TaskController::class, 'getMyTasks']);
});