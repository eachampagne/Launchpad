import { useState } from "react";
import type { WidgetSettings } from "../../types/LayoutTypes";

export default function Search({
  widgetId,
  settings,
}: {
  widgetId: number;
  settings: WidgetSettings | null;
}) {
  //Set search query state
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    //If nothing typed do nothing
    if (!query.trim()) return;
    //Google search URL & convert query to string
    const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
    window.open(url, "_blank", "noopener,noreferrer");
    setQuery("");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 12px", gap: "8px" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search Google..."
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: "1rem",
          color: "inherit",
        }}
        autoComplete="off"
      />
      <button onClick={handleSearch}>Go</button>
    </div>
  );
}