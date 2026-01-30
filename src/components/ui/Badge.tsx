import React, { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export function Badge({ variant = 'default', size = 'md', children }: BadgeProps) {
    const classes = [
        styles.badge,
        styles[variant],
        size !== 'md' ? styles[size] : '',
    ]
        .filter(Boolean)
        .join(' ');

    return <span className={classes}>{children}</span>;
}
