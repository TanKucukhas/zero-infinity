"use client";
import { useEffect, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, children, className = "" }: ModalProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scroll when modal is open and remove default margins
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center"
      style={{ margin: 0, padding: 0 }}
      onClick={onClose}
    >
      {/* Apple-style backdrop with blur and opacity */}
      <div 
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        style={{ margin: 0, padding: 0 }}
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className={`relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full transform transition-all duration-200 ${className || 'max-w-md'}`}
        style={{ margin: '0 16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}