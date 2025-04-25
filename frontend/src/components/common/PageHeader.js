// src/components/common/PageHeader.js
import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * PageHeader component renders a consistent header for pages with title, breadcrumbs, and optional action button
 */
export const PageHeader = ({ 
  title, 
  breadcrumbs = [], 
  actionButton = null 
}) => {
  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {title}
        </Typography>
        {actionButton}
      </Box>
      
      {breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography key={index} color="text.primary">
                {breadcrumb.label}
              </Typography>
            ) : (
              <MuiLink
                key={index}
                component={RouterLink}
                to={breadcrumb.path}
                underline="hover"
                color="inherit"
              >
                {breadcrumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
};

export default PageHeader;