"use client";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-md bg-white p-5 shadow-card">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="mt-2 text-sm text-ink/70">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-md px-3 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
              danger ? "bg-rust hover:bg-rust/90" : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
