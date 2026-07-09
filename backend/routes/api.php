<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Employee list (For the assignment dropdown)
Route::get('/users',  [UserController::class, 'index']);

// Tasks (Admin)
Route::apiResource('/tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);

// Nested comments on tasks
Route::get('/tasks/{task}/comments', [TaskController::class, 'getComments']);
Route::post('/tasks/{task}/comments', [TaskController::class, 'addComment']);

// Tasks for a specific user (Employee) - nested resource
Route::get('/users/{user}/tasks', [TaskController::class, 'getMyTasks']);