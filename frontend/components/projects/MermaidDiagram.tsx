"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        try {
          // Clean up the markdown fences if they exist in the diagram string
          let cleanChart = chart.trim();
          if (cleanChart.startsWith("```mermaid")) {
            cleanChart = cleanChart.replace("```mermaid", "");
            if (cleanChart.endsWith("```")) {
              cleanChart = cleanChart.substring(0, cleanChart.length - 3);
            }
          }
          
          setError(null);
          const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substring(7)}`, cleanChart);
          if (isMounted) {
             containerRef.current.innerHTML = svg;
          }
        } catch (err: any) {
          if (isMounted) {
            console.error("Mermaid parsing failed", err);
            setError("Failed to render diagram. The AI generated invalid Mermaid syntax.");
          }
        }
      }
    };

    renderDiagram();

    return () => { isMounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-mono border border-red-100">
        <p className="font-bold mb-2">⚠ {error}</p>
        <pre className="overflow-auto text-xs">{chart}</pre>
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center overflow-auto py-8"></div>;
}
