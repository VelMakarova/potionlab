import type { ReactNode } from "react";
export function LaboratoryLayout({
  catalog,
  workspace,
}: {
  catalog: ReactNode;
  workspace: ReactNode;
}) {
  return (
    <div className="lab-layout">
      {catalog}
      {workspace}
    </div>
  );
}
