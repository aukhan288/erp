<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_user_roles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('role_id')
                ->constrained()
                ->onDelete('cascade');

            $table->timestamps();

            // prevent duplicate assignments
            $table->unique(['user_id', 'company_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_user_roles');
    }
};