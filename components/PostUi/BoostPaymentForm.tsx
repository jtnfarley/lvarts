'use client'

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function BoostPaymentForm(props:{onSuccess: () => void, onError: (message:string) => void}) {
	const { onSuccess, onError } = props;
	const stripe = useStripe();
	const elements = useElements();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) return;

		setIsSubmitting(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}${window.location.pathname}`
			},
			redirect: 'if_required'
		});

		setIsSubmitting(false);

		if (error) {
			onError(error.message || 'Payment failed');
			return;
		}

		onSuccess();
	}

    return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<PaymentElement/>
			<button type='submit' disabled={!stripe || isSubmitting} className='lvartsmusic-pill-accent'>
				{isSubmitting ? 'Processing...' : 'Confirm payment'}
			</button>
		</form>
    )
}
