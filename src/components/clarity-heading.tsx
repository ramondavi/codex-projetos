"use client";

import { useEffect, useRef, useState } from "react";

export function ClarityHeading() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  return <h2 ref={headingRef} className={`section__title section__title--single-line${visible ? " is-visible" : ""}`}><span className="section__title--less-repetition">Menos repetição.</span> Mais clareza.</h2>;
}
