<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();

        if ($user && $user->hasRole('employee')) {
            return [
                'status' => ['required', 'in:pending,in_progress,completed'],
            ];
        }

        if ($user && $user->hasRole('admin')) {
            return [
                'title'       => ['sometimes', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'due_date'    => ['nullable', 'date'],
                'user_ids'    => ['sometimes', 'array', 'min:1'],
                'user_ids.*'  => [
                    Rule::exists('users', 'id')->where('is_active', true)
                ],
                'priority'    => ['nullable', 'in:low,medium,high'],
                'status'      => ['nullable', 'in:pending,in_progress,completed'],
            ];
        }

        return [];
    }
}
