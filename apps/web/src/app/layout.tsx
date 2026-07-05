import type { ReactNode } from "react";

export const metadata = {
  title: "RepoMatch",
  description: "Personalized open-source repo recommendations for your GitHub README.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
