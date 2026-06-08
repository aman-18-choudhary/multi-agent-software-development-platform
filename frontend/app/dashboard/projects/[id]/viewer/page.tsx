"use client";

import React, { useEffect, useState } from 'react';
import { CssVarsProvider, Box, Typography, Button, IconButton } from '@mui/joy';
import { ArrowLeft, Box as BoxIcon, Database, Layers, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ArchitectureViewer from '@/components/3d-viewer/ArchitectureViewer';
import InspectorPanel from '@/components/3d-viewer/InspectorPanel';
import PlaybackControls from '@/components/3d-viewer/PlaybackControls';
import { useViewerStore } from '@/lib/store/useViewerStore';

export default function ArchitectureViewerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const setVersions = useViewerStore((state) => state.setVersions);
  const [loading, setLoading] = useState(true);

  // Fetch versions
  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/projects/${params.id}/versions`);
        const data = await res.json();
        
        // Data usually comes back sorted by version desc, let's reverse it to chronological order
        const sortedData = data.sort((a: any, b: any) => a.version_number - b.version_number);
        setVersions(sortedData);
      } catch (err) {
        console.error("Failed to fetch versions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVersions();
  }, [params.id, setVersions]);

  return (
    <CssVarsProvider defaultMode="dark">
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        
        {/* Left Sidebar */}
        <Box 
          sx={{ 
            width: 260, 
            bgcolor: 'background.surface', 
            borderRight: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            p: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <BoxIcon size={24} color="#0B6BCB" />
            <Typography level="title-lg" fontWeight="xl">MASDP Viewer</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <Button variant="plain" color="neutral" startDecorator={<LayoutDashboard size={18} />} sx={{ justifyContent: 'flex-start' }} onClick={() => router.push(`/dashboard/projects/${params.id}`)}>
              Project Dashboard
            </Button>
            <Button variant="soft" color="primary" startDecorator={<Layers size={18} />} sx={{ justifyContent: 'flex-start' }}>
              3D Architecture
            </Button>
            <Button variant="plain" color="neutral" startDecorator={<Database size={18} />} sx={{ justifyContent: 'flex-start' }}>
              Data Models
            </Button>
          </Box>

          <Button variant="outlined" color="neutral" startDecorator={<ArrowLeft size={18} />} onClick={() => router.push('/dashboard')}>
            Back to Hub
          </Button>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          {/* Top Nav */}
          <Box sx={{ height: 60, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', px: 3, bgcolor: 'background.surface' }}>
            <Typography level="title-md">Premium Architecture Visualization</Typography>
          </Box>

          {/* 3D Canvas Area */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Loading spatial data...</Typography>
              </Box>
            ) : (
              <>
                <ArchitectureViewer />
                <InspectorPanel />
                <PlaybackControls />
              </>
            )}
          </Box>

        </Box>
      </Box>
    </CssVarsProvider>
  );
}
