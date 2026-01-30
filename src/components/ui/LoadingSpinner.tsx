import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface PageLoadingProps {
    message?: string;
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
    return <div className={`${styles.spinner} ${styles[size]}`} />;
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
    return (
        <div className={styles.fullPage}>
            <LoadingSpinner size="lg" />
            <span className={styles.loadingText}>{message}</span>
        </div>
    );
}
