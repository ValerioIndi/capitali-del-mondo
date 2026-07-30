import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Modale semplice con overlay. Si chiude col tasto ESC, cliccando fuori
 * o sulla X in alto a destra.
 */
export default function Modal({ open, onClose, title, children, maxWidth = "sm" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    // blocca lo scroll dietro
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`relative z-10 w-full ${widths[maxWidth]} rounded-2xl border border-border/60 bg-card p-6 shadow-2xl`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        {title && (
          <h2 className="mb-3 pr-8 text-lg font-bold tracking-tight">{title}</h2>
        )}
        {children}
      </motion.div>
    </div>
  );
}
