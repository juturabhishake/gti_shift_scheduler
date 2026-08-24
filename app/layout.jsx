import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata = {
  title: "GTI Shift Scheduler",
  description:
    "A simple and efficient shift scheduling application for GTI employees.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}