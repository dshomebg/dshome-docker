"use client";

import React, { useState, useEffect } from "react";
import { generalSettingsService } from "@/lib/services/general-settings.service";

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await generalSettingsService.getGeneralSettings();
      const settings = response.data;
      setBaseUrl(settings.baseUrl);
    } catch (error) {
      console.error("Error fetching settings:", error);
      alert("Грешка при зареждане на настройките");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await generalSettingsService.updateGeneralSettings({
        baseUrl: baseUrl,
      });
      alert("Настройките са запазени успешно!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Грешка при запазване на настройките");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Общи настройки</h1>
        <p className="text-gray-500 mt-1">
          Глобални настройки за целия сайт
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Основен URL (BaseUrl)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Основният URL на сайта, който ще се използва за генериране на пълни адреси
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Запазване..." : "Запази"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
