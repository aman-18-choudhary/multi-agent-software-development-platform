export interface GraphNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'client' | 'default';
  description?: string;
  details?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function transformArchitectureToGraph(architectOutput: any): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Set<string>();

  const addNode = (id: string, label: string, type: GraphNode['type'] = 'default', details: any = {}) => {
    if (!nodeMap.has(id)) {
      nodes.push({ id, label, type, details });
      nodeMap.add(id);
    }
  };

  const addEdge = (source: string, target: string, label?: string) => {
    const edgeId = `${source}-${target}`;
    edges.push({ id: edgeId, source, target, label });
  };

  // Try to parse Mermaid architecture diagram
  const mermaidStr = architectOutput?.architecture_diagram || architectOutput?.system_diagram_mermaid || "";
  
  if (mermaidStr) {
    const lines = mermaidStr.split('\\n');
    lines.forEach((line: string) => {
      const edgeMatch = line.match(/([a-zA-Z0-9_]+)(?:\\[(.*?)\\]|\\((.*?)\\))?\\s*--\u003E\\s*(?:\\|(.+?)\\|\\s*)?([a-zA-Z0-9_]+)(?:\\[(.*?)\\]|\\((.*?)\\))?/);
      if (edgeMatch) {
        const sourceId = edgeMatch[1];
        const sourceLabel = edgeMatch[2] || edgeMatch[3] || sourceId;
        const edgeLabel = edgeMatch[4];
        const targetId = edgeMatch[5];
        const targetLabel = edgeMatch[6] || edgeMatch[7] || targetId;

        let sourceType: GraphNode['type'] = 'service';
        if (sourceLabel.toLowerCase().includes('client') || sourceLabel.toLowerCase().includes('frontend')) sourceType = 'client';
        if (sourceLabel.toLowerCase().includes('db') || sourceLabel.toLowerCase().includes('database')) sourceType = 'database';

        let targetType: GraphNode['type'] = 'service';
        if (targetLabel.toLowerCase().includes('client') || targetLabel.toLowerCase().includes('frontend')) targetType = 'client';
        if (targetLabel.toLowerCase().includes('db') || targetLabel.toLowerCase().includes('database')) targetType = 'database';

        addNode(sourceId, sourceLabel, sourceType);
        addNode(targetId, targetLabel, targetType);
        addEdge(sourceId, targetId, edgeLabel);
      }
    });
  }

  // Fallback if no valid nodes were parsed
  if (nodes.length === 0) {
    const techStack: string[] = architectOutput?.tech_stack || [];
    techStack.forEach((tech, i) => {
      const id = `node_${i}`;
      addNode(id, tech, 'default', { system_design: architectOutput?.system_design });
      if (i > 0) {
        addEdge(`node_${i - 1}`, id);
      }
    });
  }

  // Add position mapping wrapper around nodes for 3D layout
  return { nodes, edges };
}
