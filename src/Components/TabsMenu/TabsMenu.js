import React from 'react';
import { Tabs, Tab, useMediaQuery, useTheme, Box } from '@mui/material';
import TokenService from '../../Services/StorageService/TokenService';

export default function TabsMenu({ value, onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        <Tab label="Bonuses" value="bonuses" />
        {TokenService.getToken() ? <Tab label="Manage Teams" value="manage-teams"/> : ""}
        {TokenService.getToken() ? <Tab label="Enter Sales" value="enter-sales"/> : ""}
        <Tab label="Current Competition" value="competition"/>
        <Tab label="History" value="history" />

        {TokenService.getToken() ? "" : <Tab label="Log in" value="login"/>}
      </Tabs>
    </Box>
  );
}
