// src/pages/templates/Templates.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { EmptyState } from '../../components/common/EmptyState';
import TemplateCard from '../../components/templates/TemplateCard';
import TemplateCategoryList from '../../components/templates/TemplateCategoryList';
import TemplateDetailModal from '../../components/templates/TemplateDetailModal';
import CreateTaskFromTemplateForm from '../../components/templates/CreateTaskFromTemplateForm';
import { templateService, taskService } from '../../api/api';

/**
 * Templates page for browsing and using task templates
 */
const Templates = () => {
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState({
    categories: true,
    templates: true
  });
  const [error, setError] = useState({
    categories: null,
    templates: null
  });
  const [detailModal, setDetailModal] = useState({
    open: false,
    template: null
  });
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch template categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const { data } = await templateService.getCategories();
        setCategories(data);
        setError(prev => ({ ...prev, categories: null }));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(prev => ({ 
          ...prev, 
          categories: 'Failed to load categories. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, templates: true }));
      
      let data;
      if (selectedCategory === 'all') {
        const response = await templateService.getAllTemplates();
        data = response.data;
      } else {
        const response = await templateService.getTemplatesByCategory(selectedCategory);
        data = response.data;
      }
      
      setTemplates(data);
      setError(prev => ({ ...prev, templates: null }));
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError(prev => ({ 
        ...prev, 
        templates: 'Failed to load templates. Please try again.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  }, [selectedCategory]);
  
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle difficulty filter change
  const handleDifficultyFilterChange = (e) => {
    setDifficultyFilter(e.target.value);
  };
  
  // Handle sort by change
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };
  
  // Handle template detail view
  const handleViewTemplateDetails = (template) => {
    setDetailModal({
      open: true,
      template
    });
  };
  
  // Handle template detail modal close
  const handleDetailModalClose = () => {
    setDetailModal({
      open: false,
      template: null
    });
  };
  
  // Handle use template
  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setShowCreateTaskForm(true);
    setCreateTaskError(null);
  };
  
  // Handle create task from template
  const handleCreateTaskFromTemplate = async (formData) => {
    setCreateTaskLoading(true);
    setCreateTaskError(null);
    
    try {
      // Log the form data for debugging
      console.log('Creating task with data:', {
        template_id: selectedTemplate.template_id,
        ...formData
      });
      
      // Ensure all required fields are present
      if (!formData.home_id) {
        throw new Error('Home selection is required');
      }
      
      if (!formData.task_name || !formData.task_name.trim()) {
        throw new Error('Task name is required');
      }
      
      // Format data to match API expectations
      const taskData = {
        task_name: formData.task_name.trim(),
        description: formData.description?.trim() || '',
        home_id: formData.home_id,
        // Only include assigned_user_id if it's not empty
        ...(formData.assigned_user_id ? { assigned_user_id: formData.assigned_user_id } : {})
      };
      
      // Make the API call
      await templateService.createTaskFromTemplate(selectedTemplate.template_id, taskData);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Task created successfully!',
        severity: 'success'
      });
      
      // Close the form
      setShowCreateTaskForm(false);
    } catch (err) {
      console.error('Task creation error:', err);
      
      // Extract most useful error message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create task. Please try again.';
      
      setCreateTaskError(errorMessage);
      
      // Show error in snackbar
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setCreateTaskLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Filter and sort templates
  const filteredAndSortedTemplates = templates
    .filter((t) =>
      difficultyFilter === 'all' ? true : t.difficulty_level === difficultyFilter
    )
    .filter((t) =>
      t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
        case 'points_high': return b.points - a.points;
        case 'points_low': return a.points - b.points;
        case 'name_asc': return a.template_name.localeCompare(b.template_name);
        case 'name_desc': return b.template_name.localeCompare(a.template_name);
        default: return 0;
      }
    });
  
  return (
    <MainLayout>
      <PageHeader title="Task Templates" />
      
      {showCreateTaskForm ? (
        <Box mb={3}>
          <CreateTaskFromTemplateForm
            template={selectedTemplate}
            onSubmit={handleCreateTaskFromTemplate}
            loading={createTaskLoading}
            onCancel={() => {
              setShowCreateTaskForm(false);
              setCreateTaskError(null);
            }}
          />
          {createTaskError && (
            <ErrorDisplay error={createTaskError} />
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <TemplateCategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              loading={loading.categories}
              error={error.categories}
            />
          </Grid>
          
          {/* Main content */}
          <Grid item xs={12} md={9}>
            {/* Filter and search */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={difficultyFilter}
                      onChange={handleDifficultyFilterChange}
                      label="Difficulty"
                    >
                      <MenuItem value="all">All Difficulties</MenuItem>
                      <MenuItem value="Easy">Easy</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={handleSortByChange}
                      label="Sort By"
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="points_high">Points (High to Low)</MenuItem>
                      <MenuItem value="points_low">Points (Low to High)</MenuItem>
                      <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                      <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Template grid */}
            {loading.templates ? (
              <LoadingIndicator message="Loading templates..." />
            ) : error.templates ? (
              <ErrorDisplay error={error.templates} onRetry={fetchTemplates} />
            ) : filteredAndSortedTemplates.length === 0 ? (
              <EmptyState
                title="No templates found"
                description={
                  searchQuery || difficultyFilter !== 'all'
                    ? "Try adjusting your filters to see more templates."
                    : "There are no templates available in this category yet."
                }
                icon={<FilterIcon fontSize="large" />}
              />
            ) : (
              <>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredAndSortedTemplates.length} templates
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {filteredAndSortedTemplates.map(template => (
                    <Grid item xs={12} sm={6} md={4} key={template.template_id}>
                      <TemplateCard 
                        template={template}
                        onUseTemplate={handleUseTemplate}
                        onViewDetails={handleViewTemplateDetails}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Template detail modal */}
      <TemplateDetailModal 
        open={detailModal.open}
        onClose={handleDetailModalClose}
        template={detailModal.template}
        onUseTemplate={handleUseTemplate}
      />
      
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Templates;