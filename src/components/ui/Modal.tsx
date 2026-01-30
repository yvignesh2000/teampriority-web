'use client';

import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'small' | 'medium' | 'large';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'medium',
}: ModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClass = size !== 'medium' ? styles[size] : '';

    const modalContent = (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M15 5L5 15M5 5L15 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                <div className={styles.body}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );

    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null;
}
