import { create } from 'zustand';
import { GraphNode } from '../graphUtils';

export interface ProjectVersion {
  id: string;
  version_number: number;
  project_id: string;
  architect_output: any;
  created_at: string;
}

interface ViewerState {
  versions: ProjectVersion[];
  currentVersionIndex: number;
  selectedNode: GraphNode | null;
  isPlaying: boolean;
  setVersions: (versions: ProjectVersion[]) => void;
  setVersionIndex: (index: number) => void;
  setSelectedNode: (node: GraphNode | null) => void;
  togglePlayback: () => void;
  setPlayback: (isPlaying: boolean) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  versions: [],
  currentVersionIndex: 0,
  selectedNode: null,
  isPlaying: false,
  setVersions: (versions) => set({ versions }),
  setVersionIndex: (index) => set({ currentVersionIndex: index }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlayback: (isPlaying) => set({ isPlaying }),
}));
