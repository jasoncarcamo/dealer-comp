import React from 'react';
import { Tabs, Tab, useMediaQuery, useTheme, Box } from '@mui/material';

export default function TabsMenu({ value, onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: '100%',
        display: 'flex',
        justifyContent: 'center', // center horizontally
        py: 1,
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        variant="standard"
        centered={!isMobile} // centers tabs on desktop
        scrollButtons={false}
        sx={{
          width: 'auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          '& .MuiTab-root': {
            fontSize: isMobile ? '0.75rem' : '1rem',
            minWidth: isMobile ? "100%" : 120,
          },
        }}
      >
        <Tab label="Bonuses"/>
        <Tab label="Manage Teams" />
        <Tab label="Enter Sales" />
        <Tab label="Current Competition" />
        <Tab label="History" />
      </Tabs>
    </Box>
  );
}
