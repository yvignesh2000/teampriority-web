import React, { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    elevated?: boolean;
    clickable?: boolean;
    children: ReactNode;
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
}

interface CardBodyProps {
    noPadding?: boolean;
    children: ReactNode;
}

interface CardFooterProps {
    children: ReactNode;
}

export function Card({
    elevated = false,
    clickable = false,
    children,
    className = '',
    ...props
}: CardProps) {
    const classes = [
        styles.card,
        elevated ? styles.elevated : '',
        clickable ? styles.clickable : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
    return (
        <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}

export function CardBody({ noPadding = false, children }: CardBodyProps) {
    return (
        <div className={`${styles.body} ${noPadding ? styles.noPadding : ''}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children }: CardFooterProps) {
    return <div className={styles.footer}>{children}</div>;
}
