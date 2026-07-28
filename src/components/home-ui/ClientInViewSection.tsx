"use client";

import React from "react";
import { useInView } from "react-intersection-observer";

export default function ClientInViewSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });

  return (
    <div ref={ref} className="min-h-[100px]">
      {inView ? children : null}
    </div>
  );
}
