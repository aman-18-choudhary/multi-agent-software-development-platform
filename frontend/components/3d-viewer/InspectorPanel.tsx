"use client";

import React from 'react';
import { Sheet, Typography, Box, Divider, Chip, IconButton } from '@mui/joy';
import { X } from 'lucide-react';
import { useViewerStore } from '@/lib/store/useViewerStore';

export default function InspectorPanel() {
  const selectedNode = useViewerStore((state) => state.selectedNode);
  const setSelectedNode = useViewerStore((state) => state.setSelectedNode);

  if (!selectedNode) return null;

  return (
    <Sheet
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 320,
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        borderRadius: 'md',
        boxShadow: 'md',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography level="title-lg">{selectedNode.label}</Typography>
          <Chip size="sm" variant="soft" color="primary" sx={{ mt: 1 }}>
            {selectedNode.type.toUpperCase()}
          </Chip>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral" onClick={() => setSelectedNode(null)}>
          <X size={16} />
        </IconButton>
      </Box>

      <Divider />

      <Box>
        <Typography level="title-sm" sx={{ mb: 1 }}>System Context</Typography>
        <Typography level="body-sm">
          {selectedNode.details?.system_design || 'No specific design context found for this node. This node was automatically inferred from the architecture graph.'}
        </Typography>
      </Box>

      <Box>
        <Typography level="title-sm" sx={{ mb: 1 }}>ID</Typography>
        <Typography level="body-xs" sx={{ fontFamily: 'monospace', bgcolor: 'background.level1', p: 1, borderRadius: 'sm' }}>
          {selectedNode.id}
        </Typography>
      </Box>
    </Sheet>
  );
}
