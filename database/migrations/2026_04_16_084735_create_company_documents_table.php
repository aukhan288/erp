<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_documents', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('file_id');

            $table->string('title');
            $table->string('category')->nullable();
            $table->string('document_number')->nullable();

            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();

            $table->enum('expiry_type', ['none','fixed','yearly','monthly'])->default('none');

            $table->integer('reminder_days')->default(30);

            $table->enum('status',['active','expired'])->default('active');

            $table->unsignedBigInteger('created_by')->nullable();

            $table->timestamps();

            // indexes
            $table->index('company_id');
            $table->index('expiry_date');

            // foreign keys
            $table->foreign('file_id')->references('id')->on('files')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_documents');
    }
};