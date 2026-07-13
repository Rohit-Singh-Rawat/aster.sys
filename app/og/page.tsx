import type { Metadata } from "next";
import { AppOgPreview } from "@/components/playground/og-app-preview";
import { CascadeOgPreview } from "@/components/playground/og-fader-preview";
import { PlaygroundThemeProvider } from "@/components/playground/theme-context";

export const metadata: Metadata = {
  title: "Open Graph Screenshots",
  description: "Static rendered OG images for manual screenshotting.",
  robots: { index: false, follow: false },
};

export default function OgScreenshotsPage() {
  return (
    <PlaygroundThemeProvider>
      <div className="flex flex-1 flex-col items-center px-6 py-16 gap-16 bg-slate-50 min-h-screen">
        <div className="w-full max-w-[1200px] flex flex-col gap-4">
          <h1 className="font-medium text-3xl tracking-tight">
            Open Graph Screenshots
          </h1>
          <p className="text-slate-500">
            Use these 1200x630 pixel-perfect canvases to manually take
            screenshots for Open Graph images. There are no rounded borders on
            the canvases, so screenshots will perfectly match the required
            aspect ratio.
          </p>
        </div>

        <div className="flex w-full max-w-[1200px] flex-col gap-4">
          <h2 className="font-medium text-2xl tracking-tight">
            App Default OG
          </h2>
          <AppOgPreview />
        </div>

        <div className="flex w-full max-w-[1200px] flex-col gap-4">
          <h2 className="font-medium text-2xl tracking-tight">
            Fader Component OG
          </h2>
          <CascadeOgPreview />
        </div>
      </div>
    </PlaygroundThemeProvider>
  );
}
