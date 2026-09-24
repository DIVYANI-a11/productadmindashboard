export default function EmptyState({
  title = "Nothing here yet",
  description = "Try changing your filters or search term.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line py-16 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="max-w-xs text-sm text-ink/60">{description}</p>
      {action}
    </div>
  );
}
