export type ClothingColor = {
  name: string;
  hex: string;
};

/** Common clothing colours for Bodice by Kueen */
export const CLOTHING_COLORS: ClothingColor[] = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f4f4f4" },
  { name: "Ivory", hex: "#f7f2ea" },
  { name: "Nude", hex: "#e8c4a8" },
  { name: "Champagne", hex: "#d4af7a" },
  { name: "Butter Yellow", hex: "#f5e08a" },
  { name: "Brown", hex: "#6b3e26" },
  { name: "Chocolate", hex: "#3d2314" },
  { name: "Burgundy", hex: "#6b1e2a" },
  { name: "Red", hex: "#b91c1c" },
  { name: "Blush", hex: "#e8a0b0" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Fuchsia Pink", hex: "#e83e8c" },
  { name: "Magenta", hex: "#c026d3" },
  { name: "Sky Blue", hex: "#87ceeb" },
  { name: "Royal Blue", hex: "#1d4ed8" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Mint Green", hex: "#98e4c2" },
  { name: "Fayrouz Green", hex: "#2ec4b6" },
  { name: "Olive", hex: "#556b2f" },
  { name: "Army Green", hex: "#4b5320" },
  { name: "Emerald", hex: "#0f5c4c" },
  { name: "Gold", hex: "#c9a227" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Light Grey", hex: "#d1d5db" },
  { name: "Ash", hex: "#9a9a9a" },
  { name: "Grey", hex: "#6b7280" },
];

export function getColorHex(name: string): string | null {
  const match = CLOTHING_COLORS.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
  return match?.hex ?? null;
}
