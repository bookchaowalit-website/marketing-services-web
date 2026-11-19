import { ImageResponse } from "next/og";

// Share preview for links to the site (og:image and, via twitter-image, the X card).
export const alt = "Services, a Bookchaowalit demo catalog app";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96, background: "#f5f5f7", color: "#1d1d1f", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 32, color: "#6e6e73" }}>Bookchaowalit</div>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2, marginTop: 16 }}>Services</div>
        <div style={{ fontSize: 40, color: "#515154", marginTop: 24, maxWidth: 900 }}>A small catalog of what you offer: lists, search and undo, saved in your browser.</div>
        <div style={{ display: "flex", gap: 16, marginTop: 56 }}>
          <div style={{ padding: "10px 24px", borderRadius: 999, background: "#e3f5e8", color: "#136c2e", fontSize: 30, fontWeight: 600 }}>Available</div>
          <div style={{ padding: "10px 24px", borderRadius: 999, background: "#fdf0d5", color: "#8a5300", fontSize: 30, fontWeight: 600 }}>Draft</div>
          <div style={{ padding: "10px 24px", borderRadius: 999, background: "#ececf0", color: "#515154", fontSize: 30, fontWeight: 600 }}>Paused</div>
        </div>
      </div>
    ),
    size,
  );
}
