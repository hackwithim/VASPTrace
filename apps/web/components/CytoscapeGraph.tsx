"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info } from "lucide-react";

interface CytoscapeGraphProps {
  graphData: {
    nodes: any[];
    edges: any[];
    summary: any;
  } | null;
  onSelectNode: (nodeData: any) => void;
  onSelectEdge: (edgeData: any) => void;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  graphData,
  onSelectNode,
  onSelectEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Convert nodes to Cytoscape format
    const cyNodes = (graphData.nodes || []).map((n) => ({
      data: {
        id: n.id,
        label: n.is_suspect
          ? `SUSPECT\n${n.address.substring(0, 6)}...${n.address.substring(n.address.length - 4)}`
          : n.is_vasp
          ? `${n.vasp_name || 'VASP'}\n${n.address.substring(0, 6)}...${n.address.substring(n.address.length - 4)}`
          : `Hop ${n.hop_level}\n${n.address.substring(0, 6)}...${n.address.substring(n.address.length - 4)}`,
        address: n.address,
        entity_type: n.entity_type,
        is_suspect: n.is_suspect,
        is_vasp: n.is_vasp,
        vasp_name: n.vasp_name,
        total_in: n.total_in,
        total_out: n.total_out,
        tx_count: n.tx_count,
        hop_level: n.hop_level,
        chain: n.chain,
      },
    }));

    // Convert edges to Cytoscape format
    const cyEdges = (graphData.edges || []).map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: `${e.amount.toFixed(2)} ${e.asset}`,
        tx_hash: e.tx_hash,
        amount: e.amount,
        asset: e.asset,
        timestamp: e.timestamp,
        edge_type: e.edge_type,
      },
    }));

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#FFFFFF",
            "border-width": 2,
            "border-color": "#475569",
            "label": "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "font-size": "10px",
            "font-family": "monospace",
            "color": "#0F172A",
            "width": 75,
            "height": 55,
            "shape": "roundrectangle",
            "text-max-width": "70px",
          },
        },
        // Suspect Node Styling
        {
          selector: "node[?is_suspect]",
          style: {
            "background-color": "#FFF7ED",
            "border-color": "#EA580C",
            "border-width": 3,
            "color": "#9A3412",
            "font-weight": "bold",
            "shape": "rectangle",
          },
        },
        // VASP Node Styling
        {
          selector: "node[?is_vasp]",
          style: {
            "background-color": "#EFF6FF",
            "border-color": "#1D4ED8",
            "border-width": 3,
            "color": "#1E3A8A",
            "font-weight": "bold",
            "shape": "diamond",
            "width": 85,
            "height": 65,
          },
        },
        // Edge Styling
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#94A3B8",
            "target-arrow-color": "#94A3B8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "label": "data(label)",
            "font-size": "9px",
            "color": "#334155",
            "text-background-color": "#FFFFFF",
            "text-background-opacity": 0.85,
            "text-background-padding": "2px",
            "arrow-scale": 1.2,
          },
        },
        // Direct Deposit Edge Styling
        {
          selector: "edge[edge_type = 'deposit']",
          style: {
            "line-color": "#2563EB",
            "target-arrow-color": "#2563EB",
            "width": 3,
            "line-style": "dashed",
          },
        },
        // Selection highlight
        {
          selector: ":selected",
          style: {
            "border-color": "#2563EB",
            "border-width": 4,
            "line-color": "#2563EB",
            "target-arrow-color": "#2563EB",
          },
        },
      ],
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 40,
        spacingFactor: 1.5,
        animate: false,
      },
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      setSelectedElement({ type: "node", data: node.data() });
      onSelectNode(node.data());
    });

    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      setSelectedElement({ type: "edge", data: edge.data() });
      onSelectEdge(edge.data());
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedElement(null);
      }
    });

    cyRef.current = cy;
    cy.fit();

    return () => {
      cy.destroy();
    };
  }, [graphData]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();
  const handleReset = () => {
    if (!cyRef.current) return;
    cyRef.current.layout({ name: "breadthfirst", directed: true, spacingFactor: 1.5 }).run();
    cyRef.current.fit();
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur border border-slate-200 rounded-md p-1 shadow-sm">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Canvas"
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Layout"
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur border border-slate-200 rounded px-3 py-2 text-[11px] shadow-sm flex items-center gap-4 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-orange-500 bg-orange-50 rounded-sm" />
          <span>Suspect Wallet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-slate-600 bg-white rounded-sm" />
          <span>Intermediary Wallet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-blue-600 bg-blue-50 rotate-45 rounded-sm" />
          <span>Known VASP Deposit</span>
        </div>
      </div>

      {/* Cytoscape Canvas */}
      <div ref={containerRef} className="w-full h-full flex-1" />
    </div>
  );
};
