"use client";

import { useEffect, useState } from "react";
import { useOrderContext } from "@/components/OrderContext";

const DELIVERY_AREAS = [
  "Madhuban",
  "Talimpur",
  "Dihutola",
  "Gangapur",
  "Bajitpur",
  "pakariya",
  "Bahuaara",
];

export default function ServiceSelectionModal() {
  const { serviceType, setServiceType, deliveryArea, setDeliveryArea, isModalOpen, closeModal } = useOrderContext();
  const [localService, setLocalService] = useState<typeof serviceType>(serviceType);
  const [localArea, setLocalArea] = useState<string | null>(deliveryArea);

  useEffect(() => {
    setLocalService(serviceType);
  }, [serviceType]);

  useEffect(() => {
    setLocalArea(deliveryArea);
  }, [deliveryArea]);

  function confirmSelection() {
    setServiceType(localService);
    setDeliveryArea(localService === "delivery" ? (localArea ?? null) : null);
    closeModal();
  }

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How would you like to get your pizza?</h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["delivery", "pickup", "dinein"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setLocalService(opt)}
              className={`rounded-lg border px-3 py-2 text-sm capitalize ${localService === opt ? "border-red-600 text-red-700 bg-red-50" : "border-gray-300 text-gray-700"}`}
            >
              {opt.replace("dinein", "dine-in")}
            </button>
          ))}
        </div>

        {localService === "delivery" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select delivery area</label>
            <div className="grid grid-cols-2 gap-2">
              {DELIVERY_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setLocalArea(area)}
                  className={`rounded-lg border px-3 py-2 text-sm ${localArea === area ? "border-red-600 text-red-700 bg-red-50" : "border-gray-300 text-gray-700"}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700">Cancel</button>
          <button
            onClick={confirmSelection}
            disabled={localService === null || (localService === "delivery" && !localArea)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white disabled:opacity-60"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 