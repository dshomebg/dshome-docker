"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AttributeForm from "@/components/attributes/AttributeForm";
import { attributesService, AttributeGroup } from "@/lib/services/attributes.service";

export default function EditAttributePage() {
  const params = useParams();
  const id = params.id as string;
  const [attributeGroup, setAttributeGroup] = useState<AttributeGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttributeGroup = async () => {
      try {
        setLoading(true);
        const response = await attributesService.getAttributeGroup(id);
        setAttributeGroup(response.data);
      } catch (err: any) {
        console.error("Error fetching attribute group:", err);
        setError(err.response?.data?.message || "Failed to load attribute group");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAttributeGroup();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading attribute group...</p>
        </div>
      </div>
    );
  }

  if (error || !attributeGroup) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-error-50 p-6 text-center dark:bg-error-500/10">
          <p className="text-error-700 dark:text-error-400">
            {error || "Attribute group not found"}
          </p>
        </div>
      </div>
    );
  }

  return <AttributeForm attributeGroup={attributeGroup} mode="edit" />;
}
