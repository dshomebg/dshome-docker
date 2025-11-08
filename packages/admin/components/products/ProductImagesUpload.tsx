"use client";

import { useState, useRef } from "react";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { uploadImage, base64ToFile } from "@/lib/utils/upload";
import { urlToBase64 } from "@/lib/utils/image";
import ImageEditor from "../ui/ImageEditor";

interface ProductImage {
  url: string;
  position: number;
  isPrimary: boolean;
}

interface ProductImagesUploadProps {
  images: ProductImage[];
  productName: string;
  onChange: (images: ProductImage[]) => void;
}

export default function ProductImagesUpload({
  images,
  productName,
  onChange,
}: ProductImagesUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<{ index: number; url: string } | null>(null);
  const [editorImage, setEditorImage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    try {
      setUploading(true);
      setError(null);

      const uploadPromises = files.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      const newImages: ProductImage[] = uploadedUrls.map((url, index) => ({
        url,
        position: images.length + index,
        isPrimary: images.length === 0 && index === 0, // First image is primary if no images exist
      }));

      onChange([...images, ...newImages]);
    } catch (err: any) {
      console.error("Error uploading images:", err);
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder positions and set first as primary
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      position: i,
      isPrimary: i === 0,
    }));
    onChange(reorderedImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    // Update positions and set first as primary
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      position: i,
      isPrimary: i === 0,
    }));

    onChange(reorderedImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleEditClick = async (index: number) => {
    try {
      setUploading(true);
      setError(null);

      const image = images[index];
      const base64Image = await urlToBase64(image.url);
      setEditorImage(base64Image);
      setEditingImage({ index, url: image.url });
    } catch (err: any) {
      console.error("Error loading image for editing:", err);
      setError("Failed to load image for editing");
    } finally {
      setUploading(false);
    }
  };

  const handleEditSave = async (editedImageBase64: string) => {
    if (!editingImage) return;

    try {
      setUploading(true);
      setError(null);

      const file = base64ToFile(editedImageBase64, `edited-${Date.now()}.png`);
      const imageUrl = await uploadImage(file);

      const newImages = images.map((img, i) =>
        i === editingImage.index ? { ...img, url: imageUrl } : img
      );

      onChange(newImages);
      setEditingImage(null);
      setEditorImage("");
    } catch (err: any) {
      console.error("Error uploading edited image:", err);
      setError(err.message || "Failed to upload edited image");
    } finally {
      setUploading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingImage(null);
    setEditorImage("");
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-4">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            uploading
              ? "cursor-not-allowed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Кликнете или провлачете снимки тук
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Можете да изберете няколко снимки наведнъж
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative cursor-move overflow-hidden rounded-lg border-2 ${
                draggedIndex === index
                  ? "border-brand-500 opacity-50"
                  : "border-gray-300 dark:border-gray-700"
              }`}
              style={{ height: "180px", width: "180px" }}
            >
              {/* Drag Handle */}
              <div className="absolute left-2 top-2 z-10 rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white" />
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute right-2 top-2 z-10 rounded bg-brand-500 px-2 py-1 text-xs font-medium text-white">
                  Главна
                </div>
              )}

              {/* Image */}
              <img
                src={image.url}
                alt={`${productName} ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Action Buttons on Hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleEditClick(index)}
                  disabled={uploading}
                  className="rounded bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Редакция
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={uploading}
                  className="rounded bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Изтрий
                </button>
              </div>

              {/* Position Indicator */}
              <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Няма добавени снимки. Добавете поне една снимка за продукта.
          </p>
        </div>
      )}

      {/* Alt Tag Info */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Автоматичен alt таг: {productName || "Заглавие"} 1, {productName || "Заглавие"} 2, и т.н.
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        💡 Първата снимка автоматично е главна. Провлачете снимките за пренареждане.
      </p>

      {/* Image Editor Modal */}
      {editingImage && editorImage && (
        <ImageEditor
          image={editorImage}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
}
