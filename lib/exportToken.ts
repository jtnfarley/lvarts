import { createHmac, timingSafeEqual } from 'node:crypto';

const EXPORT_LINK_LIFETIME_MS = 60 * 60 * 1000;

// Reuses the NextAuth secret, under either name it accepts. The signed text starts with
// "data-export:", so a token can't be confused with anything else signed by that secret.
export const getExportSecret = (): string => {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('Missing AUTH_SECRET (or NEXTAUTH_SECRET) env var');
    return secret;
};

const sign = (userdetailsid: number, expiresAt: number, secret: string): Buffer =>
    createHmac('sha256', secret).update(`data-export:${userdetailsid}:${expiresAt}`).digest();

// Stateless on purpose: mail scanners often open links before the person does, so a
// single-use token would already be spent. The short lifetime limits the exposure instead.
export const createExportToken = (userdetailsid: number, secret: string, now = Date.now()): string => {
    const expiresAt = now + EXPORT_LINK_LIFETIME_MS;
    return `${userdetailsid}.${expiresAt}.${sign(userdetailsid, expiresAt, secret).toString('base64url')}`;
};

// Returns the userdetails id the token was issued for, or undefined if it is malformed,
// forged or expired.
export const verifyExportToken = (token: string, secret: string, now = Date.now()): number | undefined => {
    const [idPart, expiresPart, signaturePart, ...rest] = token.split('.');
    if (!idPart || !expiresPart || !signaturePart || rest.length) return undefined;

    const userdetailsid = Number(idPart);
    const expiresAt = Number(expiresPart);
    if (!Number.isInteger(userdetailsid) || userdetailsid <= 0 || !Number.isInteger(expiresAt)) return undefined;
    if (expiresAt < now) return undefined;

    const given = Buffer.from(signaturePart, 'base64url');
    const expected = sign(userdetailsid, expiresAt, secret);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined;

    return userdetailsid;
};
