import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className={styles.inputWrapper}>
                {label && <label className={styles.label}>{label}</label>}
                <input
                    ref={ref}
                    className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
                    {...props}
                />
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className={styles.inputWrapper}>
                {label && <label className={styles.label}>{label}</label>}
                <textarea
                    ref={ref}
                    className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''} ${className}`}
                    {...props}
                />
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
