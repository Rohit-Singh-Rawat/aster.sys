'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type React from 'react';
import { useEffect, useRef } from 'react';

export function SiteSurface({ children }: { children: React.ReactNode }) {
	const surfaceRef = useRef<HTMLDivElement>(null);

	const rawReveal = useMotionValue(0);

	const springReveal = useSpring(rawReveal, {
		stiffness: 250,
		damping: 28,
		mass: 0.8,
		restDelta: 0.0001,
	});

	const scale = useTransform(springReveal, [0, 1], [1, 0.975]);
	const borderRadius = useTransform(springReveal, [0, 1], [0, 30]);

	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		const handleScroll = () => {
			const footerWrapper = document.getElementById('site-footer-wrapper');
			if (!footerWrapper) return;

			const footerRect = footerWrapper.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			let reveal = 0;
			if (footerRect.top < viewportHeight) {
				const visiblePixels = viewportHeight - footerRect.top;
				// Prevent division by zero
				const footerHeight = Math.max(1, footerRect.height);
				reveal = Math.min(1, Math.max(0, visiblePixels / footerHeight));
			}

			rawReveal.set(reveal);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	}, [rawReveal]);

	return (
		<motion.div
			ref={surfaceRef}
			className='flex flex-col min-h-dvh relative z-10 bg-background overflow-clip'
			style={{
				transformOrigin: 'top',
				scale: prefersReducedMotion ? 1 : scale,
				borderBottomLeftRadius: prefersReducedMotion ? 0 : borderRadius,
				borderBottomRightRadius: prefersReducedMotion ? 0 : borderRadius,
				boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
			}}
		>
			{children}
		</motion.div>
	);
}
