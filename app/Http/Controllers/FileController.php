<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\File;
use App\Models\Task;

class FileController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'nullable|file|max:20480',
        ]);

        

        $file = $request->file('file');
        $path = $file->store('uploads', 'public');

        $uploaded = File::create([
            'name' => $file->getClientOriginalName(),
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'url' => asset("storage/$path"),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json([
            'id' => $uploaded->id,
            'url' => $uploaded->url,
            'name' => $uploaded->name,
        ]);
    }
}