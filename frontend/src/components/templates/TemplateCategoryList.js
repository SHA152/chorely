// src/components/templates/TemplateCategoryList.js
import React, { useEffect, useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Divider,
  Paper,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { CategoryIcon } from '../../components/templates/CategoryIcon';
import API from '../../api/api';

/**
 * TemplateCategoryList displays a list of template categories for filtering
 */
const TemplateCategoryList = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/templates/categories')
      .then(response => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error fetching categories');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.12)'
      }}
    >
      <Box sx={{ p: 2, backgroundColor: '#f5f7fa' }}>
        <Typography variant="h6" component="h2">
          Categories
        </Typography>
      </Box>
      <Divider />

      <List sx={{ p: 0 }}>
        <ListItem disablePadding>
          <ListItemButton 
            selected={selectedCategory === 'all'}
            onClick={() => onSelectCategory('all')}
          >
            <ListItemIcon>
              <CategoryIcon category="all" />
            </ListItemIcon>
            <ListItemText primary="All Templates" />
          </ListItemButton>
        </ListItem>

        <Divider />

        {categories.length > 0 ? categories.map((category) => (
          <ListItem key={category.category_id} disablePadding>
            <ListItemButton 
              selected={selectedCategory === category.category_name}
              onClick={() => onSelectCategory(category.category_name)}
            >
              <ListItemIcon>
                <CategoryIcon category={category.icon_name || category.category_name} />
              </ListItemIcon>
              <ListItemText primary={category.category_name} />
            </ListItemButton>
          </ListItem>
        )) : (
          <ListItem>
            <ListItemText 
              primary="No categories found" 
              secondary="Templates will be added soon" 
            />
          </ListItem>
        )}

      </List>
    </Paper>
  );
};

export default TemplateCategoryList;
