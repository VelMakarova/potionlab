import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  title: string;
  closeLabel: string;
  close: () => void;
  children: ReactNode;
};
export function Modal({ title, closeLabel, close, children }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    element.showModal();
    return () => {
      element.close();
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2>{title}</h2>
          <button onClick={close} aria-label={closeLabel}>
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
