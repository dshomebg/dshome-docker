"use client";

import { useState } from "react";
import { attributesService } from "@/lib/services/attributes.service";
import { uploadImage } from "@/lib/utils/upload";

interface AddValueFormProps {
  groupId: string;
  displayType: 'dropdown' | 'radio' | 'color';
  onValueAdded: (newValue: any) => void;
  onCancel: () => void;
}

export default function AddValueForm({
  groupId,
  displayType,
  onValueAdded,
  onCancel
}: AddValueFormProps) {
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [textureImage, setTextureImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingTexture, setUploadingTexture] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Value name is required");
      return;
    }

    try {
      setLoading(true);
      const valueData: any = {
        name: name,
      };

      if (displayType === "color") {
        valueData.colorHex = colorHex;
        if (textureImage) {
          valueData.textureImage = textureImage;
        }
      }

      const response = await attributesService.createAttributeValue(groupId, valueData);
      onValueAdded(response.data);

      // Reset form
      setName("");
      setColorHex("#000000");
      setTextureImage("");
    } catch (error) {
      console.error("Error creating attribute value:", error);
      alert("Failed to create attribute value");
    } finally {
      setLoading(false);
    }
  };

  const handleTextureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTexture(true);
      const url = await uploadImage(file);
      setTextureImage(url);
    } catch (error) {
      console.error("Error uploading texture image:", error);
      alert("Failed to upload texture image");
    } finally {
      setUploadingTexture(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setColorHex("#000000");
    setTextureImage("");
    onCancel();
  };

  return (
    <div className="rounded-lg border border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-500/10">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Добави нова стойност
      </h3>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder='напр. "Червен", "16GB", "Голям"'
        />

        {displayType === "color" && (
          <div className="flex gap-3">
            {/* Small color picker with visual display */}
            <div className="w-24">
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Цвят
              </label>
              <div className="flex flex-col gap-2">
                {/* Visual color display */}
                <div
                  className="h-10 w-full rounded border-2 border-gray-300 dark:border-gray-700"
                  style={{ backgroundColor: colorHex }}
                  title={colorHex}
                />
                {/* Hidden color picker input */}
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-8 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Large texture image upload area */}
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Текстура/Изображение (опционално)
              </label>
              <div className="flex flex-col gap-2">
                {textureImage ? (
                  <div className="relative">
                    <img
                      src={textureImage}
                      alt="Preview"
                      className="h-20 w-full rounded border-2 border-gray-300 object-cover dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setTextureImage("")}
                      className="absolute right-2 top-2 rounded-full bg-error-500 px-2 py-1 text-xs text-white hover:bg-error-600"
                    >
                      ✕ Премахни
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTextureUpload}
                      disabled={uploadingTexture}
                      className="hidden"
                      id="new-texture-upload"
                    />
                    <label
                      htmlFor="new-texture-upload"
                      className="flex h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 bg-white hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-400"
                    >
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-1 text-xs text-gray-500">
                          {uploadingTexture ? "Качва се..." : "Качи изображение"}
                        </p>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="rounded bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Добави
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Отказ
          </button>
        </div>
      </div>
    </div>
  );
}
