import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const FullScreenLoader = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.9)", // semi-transparent white overlay
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000, // above everything else
      }}
    >
      <CircularProgress size={60} thickness={5} />
      <Typography variant="h6" sx={{ mt: 2, color: "#333" }}>
        {message}
      </Typography>
    </Box>
  );
};

export default FullScreenLoader;