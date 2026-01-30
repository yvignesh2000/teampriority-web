'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../auth.module.css';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const { register, error, clearError } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, name);
            router.push('/matrix');
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsLoading(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.logo}>
                    <h1 className={styles.logoText}>TeamPriority</h1>
                    <p className={styles.logoSubtext}>Focus on what matters</p>
                </div>

                <h2 className={styles.title}>Create your account</h2>
                <p className={styles.subtitle}>Join your team and start prioritizing</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {displayError && <div className={styles.error}>{displayError}</div>}

                    <Input
                        type="text"
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />

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
                        autoComplete="new-password"
                    />

                    <Input
                        type="password"
                        label="Confirm Password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />

                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerText}>or</span>
                    <span className={styles.dividerLine} />
                </div>

                <p className={styles.link}>
                    Already have an account?{' '}
                    <Link href="/login" className={styles.linkHighlight}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
