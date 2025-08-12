import React from 'react';
import { Tabs, Tab, useMediaQuery, useTheme, Box } from '@mui/material';

export default function TabsMenu({ value, onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      <Tabs
        centered
        value={value}
        onChange={onChange}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons={isMobile ? 'auto' : false}
        allowScrollButtonsMobile
        aria-label="Navigation tabs"
        sx={{
          minWidth: '320px',
          '& .MuiTab-root': {
            fontSize: isMobile ? '0.75rem' : '1rem',
            minWidth: isMobile ? 100 : 120,
          },
        }}
      >
        <Tab label="Manage Teams" />
        <Tab label="Enter Sales" />
        <Tab label="Competition" />
        <Tab label="History" />
      </Tabs>
    </Box>
  );
}
