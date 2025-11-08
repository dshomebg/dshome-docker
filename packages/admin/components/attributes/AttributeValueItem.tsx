"use client";

import { useState } from "react";
import { attributesService, AttributeValue } from "@/lib/services/attributes.service";
import { uploadImage } from "@/lib/utils/upload";

interface AttributeValueItemProps {
  value: AttributeValue;
  index: number;
  totalCount: number;
  displayType: 'dropdown' | 'radio' | 'color';
  onUpdate: (updatedValue: AttributeValue) => void;
  onDelete: (valueId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  loading: boolean;
}

export default function AttributeValueItem({
  value,
  index,
  totalCount,
  displayType,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  loading
}: AttributeValueItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: value.name,
    colorHex: value.colorHex || "#000000",
    textureImage: value.textureImage || "",
  });
  const [uploadingTexture, setUploadingTexture] = useState(false);

  const handleUpdate = async () => {
    try {
      const updateData: any = {
        name: editData.name,
      };

      if (displayType === "color") {
        updateData.colorHex = editData.colorHex;
        if (editData.textureImage) {
          updateData.textureImage = editData.textureImage;
        }
      }

      const response = await attributesService.updateAttributeValue(value.id, updateData);
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating attribute value:", error);
      alert("Failed to update attribute value");
    }
  };

  const handleDelete = () => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази стойност?")) {
      return;
    }
    onDelete(value.id);
  };

  const handleTextureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTexture(true);
      const url = await uploadImage(file);
      setEditData({ ...editData, textureImage: url });
    } catch (error) {
      console.error("Error uploading texture image:", error);
      alert("Failed to upload texture image");
    } finally {
      setUploadingTexture(false);
    }
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditData({
      name: value.name,
      colorHex: value.colorHex || "#000000",
      textureImage: value.textureImage || "",
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
      {/* Order buttons */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0 || loading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1 || loading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ▼
        </button>
      </div>

      {isEditing ? (
        /* Edit mode */
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="Име на стойност"
          />

          {displayType === "color" && (
            <>
              {/* Small color picker with visual display */}
              <div className="flex flex-col gap-1">
                <div
                  className="h-8 w-16 rounded border-2 border-gray-300 dark:border-gray-700"
                  style={{ backgroundColor: editData.colorHex }}
                  title={editData.colorHex}
                />
                <input
                  type="color"
                  value={editData.colorHex}
                  onChange={(e) => setEditData({ ...editData, colorHex: e.target.value })}
                  className="h-6 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-700"
                />
              </div>

              {/* Large texture upload area */}
              <div className="flex items-center gap-2">
                {editData.textureImage ? (
                  <div className="relative">
                    <img
                      src={editData.textureImage}
                      alt="Texture"
                      className="h-12 w-20 rounded border-2 border-gray-300 object-cover dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setEditData({ ...editData, textureImage: "" })}
                      className="absolute -right-1 -top-1 rounded-full bg-error-500 px-1.5 py-0.5 text-xs text-white hover:bg-error-600"
                    >
                      ✕
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
                      id={`edit-texture-${value.id}`}
                    />
                    <label
                      htmlFor={`edit-texture-${value.id}`}
                      className="flex h-12 w-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-300 bg-white hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="text-center">
                        <svg className="mx-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-400">
                          {uploadingTexture ? "..." : "↑"}
                        </p>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="rounded bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-600"
          >
            Запази
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600"
          >
            Отказ
          </button>
        </div>
      ) : (
        /* Display mode */
        <>
          <div className="flex flex-1 items-center gap-3">
            <span className="font-medium text-gray-900 dark:text-white">
              {value.name}
            </span>
            {displayType === "color" && (
              <>
                {value.textureImage ? (
                  <img
                    src={value.textureImage}
                    alt={`${value.name} texture`}
                    className="h-6 w-6 rounded border border-gray-300"
                  />
                ) : value.colorHex ? (
                  <div
                    className="h-6 w-6 rounded border border-gray-300"
                    style={{ backgroundColor: value.colorHex }}
                    title={value.colorHex}
                  />
                ) : null}
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEdit}
              className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Редактирай
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="text-sm text-error-600 hover:text-error-700 dark:text-error-400"
            >
              Изтрий
            </button>
          </div>
        </>
      )}
    </div>
  );
}
