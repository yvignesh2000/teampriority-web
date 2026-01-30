'use client';

import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useSync } from '@/lib/context/SyncContext';
import styles from './AppShell.module.css';

interface AppShellProps {
    children: ReactNode;
}

const navItems = [
    {
        section: 'Focus',
        items: [
            { href: '/matrix', label: 'Matrix', icon: 'matrix' },
            { href: '/goals', label: 'Weekly Goal', icon: 'goal' },
            { href: '/top3', label: "Today's Top 3", icon: 'top3' },
        ],
    },
    {
        section: 'Track',
        items: [
            { href: '/proof', label: 'Proof Log', icon: 'proof' },
            { href: '/summary', label: 'Weekly Summary', icon: 'summary' },
            { href: '/export', label: 'Export', icon: 'export' },
        ],
    },
    {
        section: 'Team',
        items: [
            { href: '/topics', label: 'Topics', icon: 'topics' },
            { href: '/team', label: 'Team', icon: 'team' },
        ],
    },
    {
        section: 'System',
        items: [
            { href: '/prompts', label: 'Prompts', icon: 'prompts' },
            { href: '/settings', label: 'Settings', icon: 'settings' },
        ],
    },
];

const icons: Record<string, ReactNode> = {
    matrix: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    goal: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    top3: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
        </svg>
    ),
    proof: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12L11 14L15 10" />
            <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
    ),
    summary: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h6" />
        </svg>
    ),
    export: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
            <path d="M12 4v12M12 4l-4 4M12 4l4 4" />
        </svg>
    ),
    topics: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 7h10M7 12h10M7 17h10" />
            <circle cx="4" cy="7" r="1" fill="currentColor" />
            <circle cx="4" cy="12" r="1" fill="currentColor" />
            <circle cx="4" cy="17" r="1" fill="currentColor" />
        </svg>
    ),
    team: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            <circle cx="19" cy="7" r="3" />
            <path d="M21 21v-2a3 3 0 00-3-3h-1" />
        </svg>
    ),
    prompts: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
};

const pageTitles: Record<string, string> = {
    '/matrix': 'Eisenhower Matrix',
    '/goals': 'Weekly Impact Goal',
    '/top3': "Today's Top 3",
    '/proof': 'Daily Proof Log',
    '/summary': 'Weekly Summary',
    '/export': 'Export Center',
    '/topics': 'Topics',
    '/team': 'Team Management',
    '/prompts': 'Prompt Center',
    '/settings': 'Settings',
};

export function AppShell({ children }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { isOnline } = useSync();

    const pageTitle = pageTitles[pathname] || 'Dashboard';
    const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

    return (
        <div className={styles.shell}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logo}>
                    <h1 className={styles.logoText}>TeamPriority</h1>
                    <p className={styles.logoSubtext}>Focus on what matters</p>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((section) => (
                        <div key={section.section} className={styles.navSection}>
                            <div className={styles.navSectionLabel}>{section.section}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className={styles.navIcon}>{icons[item.icon]}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{userInitial}</div>
                        <div>
                            <p className={styles.userName}>{user?.name}</p>
                            <p className={styles.userEmail}>{user?.email}</p>
                        </div>
                    </div>
                    <button className={styles.logoutButton} onClick={logout}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.menuButton}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                        <h2 className={styles.pageTitle}>{pageTitle}</h2>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.syncStatus}>
                            <span className={`${styles.syncDot} ${!isOnline ? styles.syncDotOffline : ''}`} />
                            {isOnline ? 'Synced' : 'Offline'}
                        </div>
                    </div>
                </header>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
}
