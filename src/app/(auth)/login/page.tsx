'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../auth.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, error, clearError } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/matrix');
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.logo}>
                    <h1 className={styles.logoText}>TeamPriority</h1>
                    <p className={styles.logoSubtext}>Focus on what matters</p>
                </div>

                <h2 className={styles.title}>Welcome back</h2>
                <p className={styles.subtitle}>Sign in to continue to your workspace</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    <Input
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerText}>or</span>
                    <span className={styles.dividerLine} />
                </div>

                <p className={styles.link}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className={styles.linkHighlight}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
