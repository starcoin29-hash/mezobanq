// hooks/useInView.ts
// Lightweight IntersectionObserver hook — replaces framer-motion's useInView
// ~15 lines vs ~60KB of framer-motion

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Trigger only once (default: true) */
  once?: boolean;
  /** rootMargin string, e.g. "-80px" */
  margin?: string;
  /** Visibility threshold 0-1 (default: 0) */
  threshold?: number;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
) {
  const { once = true, margin = "0px", threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { rootMargin: margin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, margin, threshold]);

  return { ref, isInView };
}
