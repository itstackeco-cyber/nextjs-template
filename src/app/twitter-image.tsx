import { ImageResponse } from "next/og";

export const alt = "Next.js App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#18181b",
        color: "#fafafa",
        fontSize: 48,
        fontWeight: 600,
      }}
    >
      <div>Next.js Template App</div>
      <div style={{ fontSize: 24, fontWeight: 400, marginTop: 16 }}>
        Built with the App Router
      </div>
    </div>,
    { ...size }
  );
}
