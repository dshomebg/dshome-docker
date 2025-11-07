"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { featuresService, FeatureGroup } from "@/lib/services/features.service";
import FeatureForm from "@/components/features/FeatureForm";

export default function EditFeaturePage() {
  const params = useParams();
  const id = params.id as string;
  const [featureGroup, setFeatureGroup] = useState<FeatureGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeature();
  }, [id]);

  const fetchFeature = async () => {
    try {
      setLoading(true);
      const response = await featuresService.getFeatureGroup(id);
      setFeatureGroup(response.data);
    } catch (error) {
      console.error("Error fetching feature:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!featureGroup) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          Feature not found
        </div>
      </div>
    );
  }

  return <FeatureForm featureGroup={featureGroup} mode="edit" />;
}
