<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UploadedAnalysis extends Model
{
    use HasUuids;

    protected  = [
        'user_id',
        'file_path',
        'original_name',
        'extracted_text',
        'score',
        'recommendations',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'recommendations' => 'array',
            'score' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return ->belongsTo(User::class);
    }
}
