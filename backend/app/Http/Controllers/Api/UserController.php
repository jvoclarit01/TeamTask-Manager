<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\http\JsonResponse;

class UserController extends Controller {
    public function index(): JsonResponse {
        $employees = User::role('employee') -> get(['id', 'name', 'email']);
        return response()->json($employees);
    }
}
