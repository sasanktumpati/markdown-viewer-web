import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Markdown Viewer";
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          fontSize: 160,
          fontWeight: 600,
          color: "#fff",
          letterSpacing: "-4px",
          marginBottom: 20,
        }}
      >
        md
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#666",
          letterSpacing: "1px",
          marginBottom: 15,
        }}
      >
        online markdown viewer
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#444",
        }}
      >
        md.built.systems
      </div>
    </div>,
    {
      ...size,
    },
  );
}
