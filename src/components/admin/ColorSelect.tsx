"use client";

import { useState } from "react";
import { CLOTHING_COLORS } from "@/lib/colors";

type Props = {
  name?: string;
  defaultValue?: string;
};

export function ColorSelect({ name = "color", defaultValue = "Black" }: Props) {
  const known = CLOTHING_COLORS.some((c) => c.name === defaultValue);
  const [mode, setMode] = useState<"list" | "custom">(
    known || !defaultValue ? "list" : "custom",
  );
  const [listValue, setListValue] = useState(
    known ? defaultValue : CLOTHING_COLORS[0].name,
  );
  const [customValue, setCustomValue] = useState(known ? "" : defaultValue);

  return (
    <div className="space-y-2">
      <select
        className="input"
        value={mode === "custom" ? "__custom__" : listValue}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setMode("custom");
          } else {
            setMode("list");
            setListValue(e.target.value);
          }
        }}
      >
        {CLOTHING_COLORS.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
        <option value="__custom__">Custom colour…</option>
      </select>
      {mode === "custom" && (
        <input
          type="text"
          className="input"
          placeholder="Colour name"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          required
        />
      )}
      <input
        type="hidden"
        name={name}
        value={mode === "custom" ? customValue.trim() : listValue}
      />
    </div>
  );
}
