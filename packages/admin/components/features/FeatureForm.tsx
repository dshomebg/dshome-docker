"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { featuresService, FeatureGroup } from "@/lib/services/features.service";
import FeatureValuesList from "./FeatureValuesList";

interface FeatureFormProps {
  featureGroup?: FeatureGroup;
  mode: "create" | "edit";
}

export default function FeatureForm({ featureGroup, mode }: FeatureFormProps) {
  const router = useRouter();
  const [name, setName] = useState(featureGroup?.name || "");
  const [status, setStatus] = useState<"active" | "inactive">(
    featureGroup?.status || "active"
  );
  const [values, setValues] = useState(featureGroup?.values || []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Feature group name is required");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        const response = await featuresService.createFeatureGroup({
          name,
          status,
        });
        alert("Feature group created successfully");
        router.push(`/catalog/features/${response.data.id}`);
      } else if (mode === "edit" && featureGroup) {
        await featuresService.updateFeatureGroup(featureGroup.id, {
          name,
          status,
        });
        alert("Feature group updated successfully");
        router.push("/catalog/features");
      }
    } catch (error) {
      console.error("Error saving feature group:", error);
      alert("Failed to save feature group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          {mode === "create" ? "Create Feature Group" : "Edit Feature Group"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Feature groups are used for filtering and product specifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Warranty, Origin, Power"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Values Card - Only in edit mode */}
        {mode === "edit" && featureGroup && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Feature Values
            </h2>
            <FeatureValuesList
              groupId={featureGroup.id}
              values={values}
              onValuesChange={setValues}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Feature Group" : "Update Feature Group"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/catalog/features")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
