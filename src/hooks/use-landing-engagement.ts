'use client';

import { useEffect } from 'react';
import {
  trackLandingEngagementEnded,
  trackLandingScrollDepth,
  trackLandingSectionViewed,
} from '@/lib/funnel-analytics';

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

function getScrollPercent() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.round((window.scrollY / scrollable) * 100));
}

/** Tracks landing scroll depth, section views and active time → Mixpanel. */
export function useLandingEngagement() {
  useEffect(() => {
    const viewedSections = new Set<string>();
    const reachedDepths = new Set<number>();
    let maxScrollPercent = 0;
    let lastSection: string | null = null;
    let activeMs = 0;
    let visibleSince =
      document.visibilityState === 'visible' ? performance.now() : null;
    let ended = false;
    let ticking = false;

    function pauseTimer() {
      if (visibleSince == null) return;
      activeMs += performance.now() - visibleSince;
      visibleSince = null;
    }

    function resumeTimer() {
      if (visibleSince != null) return;
      if (document.visibilityState !== 'visible') return;
      visibleSince = performance.now();
    }

    function flushScrollDepth() {
      const percent = getScrollPercent();
      if (percent > maxScrollPercent) maxScrollPercent = percent;

      for (const milestone of SCROLL_MILESTONES) {
        if (percent < milestone || reachedDepths.has(milestone)) continue;
        reachedDepths.add(milestone);
        trackLandingScrollDepth(milestone);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        flushScrollDepth();
        ticking = false;
      });
    }

    function endSession(reason: string) {
      if (ended) return;
      ended = true;
      pauseTimer();
      flushScrollDepth();

      trackLandingEngagementEnded({
        duration_ms: Math.round(activeMs),
        max_scroll_percent: maxScrollPercent,
        last_section_viewed: lastSection,
        sections_viewed: Array.from(viewedSections),
        sections_viewed_count: viewedSections.size,
        end_reason: reason,
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const section = (entry.target as HTMLElement).dataset.landingSection;
          if (!section || viewedSections.has(section)) continue;
          viewedSections.add(section);
          lastSection = section;
          trackLandingSectionViewed(section);
        }
      },
      { threshold: 0.25 },
    );

    document.querySelectorAll<HTMLElement>('[data-landing-section]').forEach((el) => {
      observer.observe(el);
    });

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        pauseTimer();
      } else {
        resumeTimer();
      }
    }

    function onPageHide() {
      endSession('pagehide');
    }

    function onPageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      ended = false;
      resumeTimer();
    }

    flushScrollDepth();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      endSession('unmount');
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);
}
