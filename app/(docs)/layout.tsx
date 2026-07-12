import Link from "next/link";
import { CodeSheet } from "@/components/docs/code-sheet";
import { CodeSheetProvider } from "@/components/docs/code-sheet-context";
import { MobileSidebarWrapper } from "@/components/docs/mobile-sidebar-wrapper";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { Logo } from "@/components/logo/logo";
import { plannedSystems } from "@/lib/planned-systems";
import { getComponentIndex, getSystemIndex } from "@/lib/registry-loader";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const systems = getSystemIndex();
  const components = getComponentIndex();

  return (
    <CodeSheetProvider>
      <MobileSidebarWrapper
        sidebar={
          <SidebarNav
            systems={systems}
            plannedSystems={plannedSystems}
            components={components}
          />
        }
      >
        {children}
      </MobileSidebarWrapper>
      <CodeSheet />
    </CodeSheetProvider>
  );
}
