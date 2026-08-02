"use client";

import React from "react";
import { useInView } from "react-intersection-observer";

export default function ClientInViewSection({
  children,
  minHeight = "100px",
  bypass = false,
}: {
  children: React.ReactNode;
  minHeight?: string;
  bypass?: boolean;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "600px 0px",
  });

  return (
    <div ref={ref} style={bypass || inView ? undefined : { minHeight }}>
      {bypass || inView ? children : null}
    </div>
  );
}
