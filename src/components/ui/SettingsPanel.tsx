"use client";

import { useEffect, useState } from "react";
// Types are in @/types

export function SettingsPanel({ value, onChange, t }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 px-5 rounded-full bg-white border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        {t?.settings ?? "Settings"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-label="Close settings"
          />

          <div className="absolute left-1/2 top-24 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl bg-white border-2 border-gray-200 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {t?.settings ?? "Settings"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-full bg-white border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t?.done ?? "Done"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t?.language ?? "Language"}
                </label>
                <div className="inline-block" style={{ width: "calc(100% - 8px)" }}>
                  <select
                    value={value.language}
                    onChange={(e) =>
                      onChange({ ...value, language: e.target.value as AppLanguage })
                    }
                    className="h-11 w-full px-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


