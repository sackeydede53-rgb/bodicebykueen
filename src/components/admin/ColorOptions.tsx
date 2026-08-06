"use client";

import { useMemo, useState } from "react";
import { CLOTHING_COLORS } from "@/lib/colors";

type Props = {
  name?: string;
  defaultColors?: string[];
};

export function ColorOptions({
  name = "colors",
  defaultColors = ["Black"],
}: Props) {
  const [selected, setSelected] = useState<string[]>(
    defaultColors.length ? defaultColors : ["Black"],
  );
  const [custom, setCustom] = useState("");

  const value = useMemo(() => {
    const extras = custom
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set([...selected, ...extras]));
  }, [selected, custom]);

  function toggle(colorName: string) {
    setSelected((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  }

  return (
    <div className="space-y-3">
      <p className="label">Colours</p>
      <p className="text-xs text-[#6f6f6f]">
        Select the colour options for this piece. Variants are created for each
        colour × size.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CLOTHING_COLORS.map((color) => {
          const active = selected.includes(color.name);
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => toggle(color.name)}
              className={`flex items-center gap-2 border px-3 py-2 text-left text-sm transition ${
                active
                  ? "border-ink bg-[#f3eee6]"
                  : "border-[#d0d0d0] bg-white hover:border-ink/40"
              }`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-black/15"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
              <span>{color.name}</span>
            </button>
          );
        })}
      </div>
      <div>
        <label className="label" htmlFor="customColors">
          Custom colours (optional)
        </label>
        <input
          id="customColors"
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="e.g. Copper, Forest Green"
          className="input"
        />
        <p className="mt-1 text-xs text-[#6f6f6f]">
          Comma-separated names not in the list above.
        </p>
      </div>
      {value.length === 0 && (
        <p className="text-sm text-danger">Select at least one colour.</p>
      )}
      <input type="hidden" name={name} value={value.join(",")} />
    </div>
  );
}
