import { useEffect, useRef, type ReactNode } from 'react';

type ModalProps = {
  title: string;
  closeLabel: string;
  close: () => void;
  children: ReactNode;
  className: string;
};

export function Modal({
  title,
  closeLabel,
  close,
  children,
  className,
}: ModalProps) {
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
      className={`lab-modal pl-wood-surface ${className}`}
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
          <button
            className="icon icon-button icon-close"
            onClick={close}
            aria-label={closeLabel}
          />
        </header>
        {children}
      </div>
    </dialog>
  );
}
