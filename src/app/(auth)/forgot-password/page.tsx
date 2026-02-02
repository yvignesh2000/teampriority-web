'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { resetPassword, error, clearError } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await resetPassword(email);
            setSuccessMessage('Password reset email sent! Check your inbox.');
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
                    <p className={styles.logoSubtext}>Recover your account</p>
                </div>

                <h2 className={styles.title}>Reset Password</h2>
                <p className={styles.subtitle}>Enter your email to receive recovery instructions</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    {successMessage && <div className={styles.success}>{successMessage}</div>}

                    <Input
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerText}>or</span>
                    <span className={styles.dividerLine} />
                </div>

                <p className={styles.link}>
                    Remember your password?{' '}
                    <Link href="/login" className={styles.linkHighlight}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
