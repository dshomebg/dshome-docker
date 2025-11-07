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
        Add New Value
      </h3>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder="Value name (e.g., Red, 16GB, Large)"
        />

        {displayType === "color" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Color
              </label>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-10 w-full rounded border border-gray-300 dark:border-gray-700"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Texture Image (optional)
              </label>
              <div className="flex items-center gap-2">
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
                  className="cursor-pointer rounded bg-gray-200 px-3 py-2 text-xs hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {uploadingTexture ? "Uploading..." : textureImage ? "Change Image" : "Upload Image"}
                </label>
                {textureImage && (
                  <div className="flex items-center gap-2">
                    <img src={textureImage} alt="Preview" className="h-10 w-10 rounded border" />
                    <button
                      type="button"
                      onClick={() => setTextureImage("")}
                      className="text-xs text-error-600 hover:text-error-700"
                    >
                      Remove
                    </button>
                  </div>
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
            Add Value
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
