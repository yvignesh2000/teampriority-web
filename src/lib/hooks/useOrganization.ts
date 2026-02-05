'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Organization } from '@/lib/types';
import { SyncEngine } from '@/lib/db/sync';
import { localDb } from '@/lib/db/dexie';
import { v4 as uuid } from 'uuid';

const orgSync = new SyncEngine<Organization>('organizations', localDb.organizations);

function generateInviteCode(): string {
    return uuid().slice(0, 8).toUpperCase();
}

export function useOrganization() {
    const { user } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrg = async () => {
            if (!user?.organizationId) {
                setLoading(false);
                return;
            }
            try {
                const org = await orgSync.getById(user.organizationId);
                setOrganization(org);
            } catch (error) {
                console.error('Error loading organization:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrg();
    }, [user?.organizationId]);

    const createOrganization = useCallback(async (name: string): Promise<Organization> => {
        if (!user) throw new Error('Not authenticated');

        const org = await orgSync.create({
            name,
            ownerId: user.id,
            inviteCode: generateInviteCode(),
            isDeleted: false,
        });

        setOrganization(org);
        return org;
    }, [user]);

    const getOrgByInviteCode = useCallback(async (code: string): Promise<Organization | null> => {
        const orgs = await orgSync.getAll();
        return orgs.find(o => o.inviteCode === code) || null;
    }, []);

    const regenerateInviteCode = useCallback(async (): Promise<string> => {
        if (!organization || !user) throw new Error('No organization');
        if (organization.ownerId !== user.id) throw new Error('Only owner can regenerate invite code');

        const newCode = generateInviteCode();
        await orgSync.update(organization.id, { inviteCode: newCode });
        setOrganization(prev => prev ? { ...prev, inviteCode: newCode } : null);
        return newCode;
    }, [organization, user]);

    return {
        organization,
        loading,
        createOrganization,
        getOrgByInviteCode,
        regenerateInviteCode,
    };
}
