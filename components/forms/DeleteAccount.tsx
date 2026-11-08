'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '../layout/Spinner';
import { deleteMyAccount } from '@/app/actions/account';

const CONFIRMATION_WORD = 'DELETE';

export default function DeleteAccount() {
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(undefined);
        try {
            // On success the action signs the user out and redirects to the home page.
            await deleteMyAccount(confirmation);
        } catch (deleteError) {
            console.error('Account deletion failed', deleteError);
            setError('We could not delete your account. Please try again.');
            setIsDeleting(false);
        }
    };

    return (
        <section className="mt-10 border-t border-lvartsmusic-border pt-6">
            <h2 className="text-lg font-semibold text-rose-500">Delete account</h2>
            <p className="mt-2 text-sm text-lvartsmusic-muted">
                Permanently deletes your profile, your posts and comments, and every comment
                other people left on your posts. This cannot be undone.
            </p>

            {!isConfirming ? (
                <Button
                    type="button"
                    className="mt-4 cursor-pointer rounded-full bg-rose-600 px-3.5 py-1.5 text-sm font-semibold text-white uppercase hover:bg-rose-700"
                    onClick={() => setIsConfirming(true)}
                >
                    Delete my account
                </Button>
            ) : (
                <div className="mt-4 flex flex-col gap-3">
                    <label className="text-sm" htmlFor="delete-confirmation">
                        Type <strong>{CONFIRMATION_WORD}</strong> to confirm
                    </label>
                    <Input
                        id="delete-confirmation"
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                        autoComplete="off"
                        disabled={isDeleting}
                    />
                    {error && <p className="text-sm text-rose-500">{error}</p>}
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            className="cursor-pointer rounded-full bg-rose-600 px-3.5 py-1.5 text-sm font-semibold text-white uppercase hover:bg-rose-700 disabled:opacity-50"
                            disabled={confirmation !== CONFIRMATION_WORD || isDeleting}
                            onClick={handleDelete}
                        >
                            Permanently delete
                        </Button>
                        <Button
                            type="button"
                            className="cursor-pointer rounded-full bg-transparent px-3.5 py-1.5 text-sm shadow-none hover:bg-transparent"
                            disabled={isDeleting}
                            onClick={() => {
                                setIsConfirming(false);
                                setConfirmation('');
                                setError(undefined);
                            }}
                        >
                            Cancel
                        </Button>
                        {isDeleting && <Spinner />}
                    </div>
                </div>
            )}
        </section>
    );
}
