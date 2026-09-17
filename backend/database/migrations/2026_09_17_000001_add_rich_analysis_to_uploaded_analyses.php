<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('uploaded_analyses', function (Blueprint $table): void {
            // Granular section scores: { contact, summary, experience, education, skills, formatting }
            $table->json('section_scores')->nullable()->after('recommendations');
            // Keywords detected as present in the resume
            $table->json('keywords_found')->nullable()->after('section_scores');
            // Recommended keywords missing from the resume
            $table->json('keywords_missing')->nullable()->after('keywords_found');
            // AI-parsed structured resume data for the "Generate Resume" feature
            $table->json('parsed_data')->nullable()->after('keywords_missing');
        });
    }

    public function down(): void
    {
        Schema::table('uploaded_analyses', function (Blueprint $table): void {
            $table->dropColumn(['section_scores', 'keywords_found', 'keywords_missing', 'parsed_data']);
        });
    }
};
