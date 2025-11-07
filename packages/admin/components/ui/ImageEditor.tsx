"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { X, RotateCcw } from "lucide-react";

interface ImageEditorProps {
  image: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

interface Filters {
  brightness: number;
  contrast: number;
  sharpen: number;
}

export default function ImageEditor({ image, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    sharpen: 0,
  });

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      sharpen: 0,
    });
    setZoom(1);
    setRotation(0);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    filters: Filters
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // Apply filters
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const brightnessFactor = filters.brightness / 100;
    const contrastFactor = (filters.contrast / 100) * 2;

    for (let i = 0; i < pixels.length; i += 4) {
      // Brightness
      pixels[i] *= brightnessFactor;
      pixels[i + 1] *= brightnessFactor;
      pixels[i + 2] *= brightnessFactor;

      // Contrast
      pixels[i] = ((pixels[i] - 128) * contrastFactor + 128);
      pixels[i + 1] = ((pixels[i + 1] - 128) * contrastFactor + 128);
      pixels[i + 2] = ((pixels[i + 2] - 128) * contrastFactor + 128);

      // Clamp values
      pixels[i] = Math.max(0, Math.min(255, pixels[i]));
      pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1]));
      pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2]));
    }

    // Apply sharpening
    if (filters.sharpen > 0) {
      const sharpenMatrix = [
        0, -filters.sharpen / 100, 0,
        -filters.sharpen / 100, 1 + (4 * filters.sharpen / 100), -filters.sharpen / 100,
        0, -filters.sharpen / 100, 0
      ];

      applyConvolution(imageData, sharpenMatrix, canvas.width, canvas.height);
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }
      }, "image/jpeg", 0.95);
    });
  };

  const applyConvolution = (
    imageData: ImageData,
    matrix: number[],
    width: number,
    height: number
  ) => {
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;

        for (let my = 0; my < 3; my++) {
          for (let mx = 0; mx < 3; mx++) {
            const idx = ((y + my - 1) * width + (x + mx - 1)) * 4;
            const weight = matrix[my * 3 + mx];
            r += pixels[idx] * weight;
            g += pixels[idx + 1] * weight;
            b += pixels[idx + 2] * weight;
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = Math.max(0, Math.min(255, r));
        output[idx + 1] = Math.max(0, Math.min(255, g));
        output[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }

    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = output[i];
    }
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation,
        filters
      );
      onSave(croppedImage);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Image
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Crop Area */}
          <div className="relative h-[400px] lg:h-[600px] flex-1 bg-gray-100 dark:bg-gray-800">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={undefined}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              style={{
                containerStyle: {
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%)`,
                },
              }}
            />
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80 border-t lg:border-l lg:border-t-0 border-gray-200 dark:border-gray-800 p-6 space-y-6">
            {/* Zoom */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

            {/* Brightness */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brightness: {filters.brightness}%
              </label>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={filters.brightness}
                onChange={(e) =>
                  setFilters({ ...filters, brightness: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contrast: {filters.contrast}%
              </label>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={filters.contrast}
                onChange={(e) =>
                  setFilters({ ...filters, contrast: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Sharpen */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sharpen: {filters.sharpen}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={filters.sharpen}
                onChange={(e) =>
                  setFilters({ ...filters, sharpen: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={resetFilters}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
              >
                Apply Changes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
