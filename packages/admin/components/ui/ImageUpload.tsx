"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Pencil, Loader2 } from "lucide-react";
import ImageEditor from "./ImageEditor";
import { uploadImage, base64ToFile } from "@/lib/utils/upload";
import { urlToBase64, getAbsoluteImageUrl } from "@/lib/utils/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const [editorImage, setEditorImage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create temporary preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const imageUrl = await uploadImage(file);

      // Update with server URL
      setPreview(imageUrl);
      onChange(imageUrl);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image");
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditClick = async () => {
    try {
      setUploading(true);
      setError(null);

      // Convert URL to base64 for editor
      const base64Image = await urlToBase64(preview);
      setEditorImage(base64Image);
      setShowEditor(true);
    } catch (err: any) {
      console.error("Error loading image for editing:", err);
      setError("Failed to load image for editing");
    } finally {
      setUploading(false);
    }
  };

  const handleEditSave = async (editedImage: string) => {
    try {
      setUploading(true);
      setError(null);

      // Convert base64 to file and upload
      const file = base64ToFile(editedImage, `edited-${Date.now()}.png`);
      const imageUrl = await uploadImage(file);

      // Update with server URL
      setPreview(imageUrl);
      onChange(imageUrl);
      setShowEditor(false);
      setEditorImage("");
    } catch (err: any) {
      console.error("Error uploading edited image:", err);
      setError(err.message || "Failed to upload edited image");
    } finally {
      setUploading(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditor(false);
    setEditorImage("");
  };

  return (
    <div>
      {error && (
        <div className="mb-2 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative inline-block">
          <div className="relative h-40 w-40 overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-700">
            <Image
              src={getAbsoluteImageUrl(preview)}
              alt="Preview"
              fill
              className="object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleEditClick}
            disabled={uploading}
            className="absolute -left-2 -top-2 rounded-full bg-brand-500 p-1 text-white shadow-lg hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Edit image"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute -right-2 -top-2 rounded-full bg-error-500 p-1 text-white shadow-lg hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            uploading
              ? "cursor-not-allowed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              : isDragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click or drag image
              </p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {showEditor && editorImage && (
        <ImageEditor
          image={editorImage}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
}
