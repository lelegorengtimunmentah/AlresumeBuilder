<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UploadedAnalysis extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'file_path',
        'original_name',
        'extracted_text',
        'score',
        'recommendations',
        'section_scores',
        'keywords_found',
        'keywords_missing',
        'parsed_data',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'score'            => 'integer',
            'recommendations'  => 'array',
            'section_scores'   => 'array',
            'keywords_found'   => 'array',
            'keywords_missing' => 'array',
            'parsed_data'      => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}