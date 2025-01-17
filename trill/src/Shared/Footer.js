import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/ProfilePage"); // Navigate to the profile page
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: 2,
        marginTop: "auto",
        backgroundColor: "#f1f1f1",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleProfileClick}
        sx={{ marginBottom: 1 }}
      >
        Profile Page
      </Button>
      <Typography variant="body2" color="textSecondary">
        © 2025 My Application. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

