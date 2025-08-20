import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ConditionalHeader from "@/components/ConditionalHeader";
import ServiceSelectionModal from "@/components/ServiceSelectionModal";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-display", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Pizza Shop",
  description: "Order delicious pizza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased bg-white`}>
        <Providers>
          <ConditionalHeader />
          <ServiceSelectionModal />
          <main className="max-w-5xl mx-auto px-4 pb-20 pt-4">
            {children}
          </main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
