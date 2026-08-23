import type { ReactNode } from "react";

type FixedDesktopWorkspaceProps = {
  children: ReactNode;
};

export default function FixedDesktopWorkspace({ children }: FixedDesktopWorkspaceProps) {
  return (
    <div style={{ position: "relative", width: "100%", minWidth: "1440px", height: "100%" }}>
      <div
        aria-label="Layout preview"
        style={{
          position: "absolute",
          top: "6px",
          right: "10px",
          zIndex: 70,
          padding: "3px 7px",
          border: "1px solid rgba(125, 211, 252, 0.3)",
          borderRadius: "4px",
          background: "rgba(5, 18, 32, 0.82)",
          color: "#b9d9f4",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        Layout Preview - fixed desktop workspace
      </div>
      {children}
    </div>
  );
}
