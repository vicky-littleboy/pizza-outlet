"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ServiceType = "delivery" | "pickup" | "dinein" | null;

type OrderContextValue = {
  serviceType: ServiceType;
  deliveryArea: string | null;
  setServiceType: (type: ServiceType) => void;
  setDeliveryArea: (area: string | null) => void;
  isSelectionComplete: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

const STORAGE_KEY = "pizza_order_selection_v1";

type StoredSelection = { serviceType: ServiceType; deliveryArea: string | null };

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [serviceType, setServiceType] = useState<ServiceType>(null);
  const [deliveryArea, setDeliveryArea] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed: StoredSelection = JSON.parse(raw);
        setServiceType(parsed.serviceType);
        setDeliveryArea(parsed.deliveryArea);
      } else {
        setIsModalOpen(true);
      }
    } catch {
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    try {
      const toStore: StoredSelection = { serviceType, deliveryArea };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      }
    } catch {}
  }, [serviceType, deliveryArea]);

  const value = useMemo<OrderContextValue>(() => ({
    serviceType,
    deliveryArea,
    setServiceType: (t) => setServiceType(t),
    setDeliveryArea: (a) => setDeliveryArea(a),
    isSelectionComplete: serviceType === "delivery" ? Boolean(deliveryArea) : Boolean(serviceType),
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
  }), [serviceType, deliveryArea, isModalOpen]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext must be used within OrderProvider");
  return ctx;
} 