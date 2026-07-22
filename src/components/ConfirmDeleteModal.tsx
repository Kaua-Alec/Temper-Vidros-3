import { AlertTriangle, X } from "lucide-react";

type ConfirmDeleteModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDeleteModal({
  open,
  title = "Você tem certeza que vai deletar?",
  description = "Esta ação não poderá ser desfeita.",
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(4, 10, 18, 0.82)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
              <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[color:var(--muted-foreground)] hover:text-white transition p-1 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[color:var(--navy-border)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-3 py-2 text-xs font-semibold text-[color:var(--muted-foreground)] hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 transition shadow-md shadow-red-600/20"
          >
            Sim, deletar
          </button>
        </div>
      </div>
    </div>
  );
}
