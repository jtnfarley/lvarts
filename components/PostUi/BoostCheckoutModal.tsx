'use client'

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { FeedRow } from '@/lib/models/initFeedRow';
import { createBoostPaymentIntent } from '@/app/actions/boost';
import { stripePromise } from '@/lib/stripeClient';
import { impressionTiers, ImpressionTierKey } from '@/constants/boost';
import BoostPaymentForm from './BoostPaymentForm';

type Step = 'select' | 'payment' | 'success' | 'error';

export default function BoostCheckoutModal(props:{postData:FeedRow, onClose: () => void}) {
	const { postData, onClose } = props;
	const [step, setStep] = useState<Step>('select');
	const [impressionTier, setImpressionTier] = useState<ImpressionTierKey>('tier_1k');
	const [clientSecret, setClientSecret] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isStarting, setIsStarting] = useState(false);

	const startCheckout = async () => {
		setIsStarting(true);
		const result = await createBoostPaymentIntent(postData.id, impressionTier);
		setIsStarting(false);

		if ('error' in result) {
			setErrorMessage(result.error);
			setStep('error');
			return;
		}

		setClientSecret(result.clientSecret);
		setStep('payment');
	}

    return (
		<div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4'>
			<div className='lvartsmusic-card relative flex w-full max-w-md flex-col max-h-[90vh]'>
				<button
					className='absolute right-3 top-3 z-10 text-lvartsmusic-muted hover:text-lvartsmusic-foreground'
					onClick={onClose}
				>
					&#x2715;
				</button>

				<div className='overflow-y-auto p-6'>

				<h2 className='text-lg font-bold text-lvartsmusic-foreground'>Boost this post</h2>

				{step === 'select' &&
					<div className='mt-4 flex flex-col gap-4'>
						<p className='text-sm text-lvartsmusic-muted'>
							Each impression is a unique user seeing your post. Repeat views from the same person don't count again — impressions purchased means unique people reached.
						</p>

						<div>
							<div className='mb-2 text-sm font-semibold text-lvartsmusic-muted'>How many impressions?</div>
							<div className='flex flex-col gap-2'>
								{(Object.keys(impressionTiers) as ImpressionTierKey[]).map(key =>
									<button
										key={key}
										onClick={() => setImpressionTier(key)}
										className={impressionTier === key ? 'lvartsmusic-pill-accent' : 'lvartsmusic-pill-outline'}
									>
										{impressionTiers[key].label}
									</button>
								)}
							</div>
						</div>

						<button onClick={startCheckout} disabled={isStarting} className='lvartsmusic-pill-accent mt-2'>
							{isStarting ? 'Starting checkout...' : 'Continue to payment'}
						</button>
					</div>
				}

				{step === 'payment' && clientSecret &&
					<div className='mt-4'>
						<Elements stripe={stripePromise} options={{ clientSecret }}>
							<BoostPaymentForm
								onSuccess={() => setStep('success')}
								onError={(message) => { setErrorMessage(message); setStep('error'); }}
							/>
						</Elements>
					</div>
				}

				{step === 'success' &&
					<div className='mt-4 flex flex-col gap-4'>
						<p className='text-lvartsmusic-foreground'>
							Your boost is processing and will appear shortly. It'll show up in feeds until it's reached its purchased impressions or 30 days, whichever comes first.
						</p>
						<button onClick={onClose} className='lvartsmusic-pill-accent'>Done</button>
					</div>
				}

				{step === 'error' &&
					<div className='mt-4 flex flex-col gap-4'>
						<p className='text-rose-500'>{errorMessage}</p>
						<button onClick={() => setStep('select')} className='lvartsmusic-pill-outline'>Try again</button>
					</div>
				}
				</div>
			</div>
		</div>
    )
}
