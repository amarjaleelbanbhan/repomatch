import type { ReactNode } from "react";

export const metadata = {
  title: "RepoMatch",
  description: "Show your OSS activity and get your next repo to try, right in your GitHub README.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
