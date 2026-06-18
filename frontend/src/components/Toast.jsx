import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function Toast({ message, type = "success" }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 toast-enter">
      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium
          ${
            type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
      >
        {type === "success" ? (
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 flex-shrink-0" />
        )}
        {message}
      </div>
    </div>
  );
}
