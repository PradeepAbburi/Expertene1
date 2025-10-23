import { useCallback, useEffect, useState } from "react";

const KEY_STREAK = "expertene_streak_v1";
const KEY_LAST = "expertene_lastPostAt_v1";
const MS_24H = 24 * 60 * 60 * 1000;

function parseDate(s: string | null): Date | null {
	if (!s) return null;
	const t = Date.parse(s);
	return Number.isNaN(t) ? null : new Date(t);
}

/**
 * useStreak
 * Client-only streak manager (localStorage).
 */
export default function useStreak() {
	const [streak, setStreak] = useState<number>(0);
	const [lastPostAt, setLastPostAt] = useState<Date | null>(null);

	useEffect(() => {
		try {
			const rawStreak = localStorage.getItem(KEY_STREAK);
			const rawLast = localStorage.getItem(KEY_LAST);
			const parsedLast = parseDate(rawLast);
			const now = Date.now();

			if (parsedLast && now - parsedLast.getTime() <= MS_24H) {
				setStreak(rawStreak ? Number(rawStreak) || 0 : 0);
				setLastPostAt(parsedLast);
			} else {
				setStreak(0);
				setLastPostAt(parsedLast);
				localStorage.setItem(KEY_STREAK, "0");
			}
		} catch (e) {
			// ignore storage errors
		}
	}, []);

	const recordPost = useCallback(() => {
		try {
			const now = new Date();
			const rawLast = localStorage.getItem(KEY_LAST);
			const prevLast = parseDate(rawLast);
			let newStreak = 1;

			if (prevLast) {
				const diff = now.getTime() - prevLast.getTime();
				if (diff <= MS_24H) {
					const prevStreak = Number(localStorage.getItem(KEY_STREAK) || "0") || 0;
					newStreak = Math.max(1, prevStreak + 1);
				} else {
					newStreak = 1;
				}
			} else {
				newStreak = 1;
			}

			localStorage.setItem(KEY_STREAK, String(newStreak));
			localStorage.setItem(KEY_LAST, now.toISOString());
			setStreak(newStreak);
			setLastPostAt(now);
			return { streak: newStreak, lastPostAt: now };
		} catch (e) {
			return { streak: 0, lastPostAt: null };
		}
	}, []);

	const resetStreak = useCallback(() => {
		try {
			localStorage.setItem(KEY_STREAK, "0");
			setStreak(0);
		} catch (e) {}
	}, []);

	return { streak, lastPostAt, recordPost, resetStreak };
}
