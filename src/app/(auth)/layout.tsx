import { Providers } from "../providers";
import ServiceSelectionModal from "@/components/ServiceSelectionModal";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ServiceSelectionModal />
      <main className="min-h-screen">
        {children}
      </main>
    </Providers>
  );
} 