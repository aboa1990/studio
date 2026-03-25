
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { Toaster } from "@/components/ui/toaster";

const { firebaseApp, firestore, auth } = initializeFirebase();

export const metadata = {
  title: "ForgeDocs - Professional Document Forge",
  description: "Build, manage, and track your professional documents with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.className}`} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
