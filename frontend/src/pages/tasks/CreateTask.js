// src/pages/tasks/CreateTask.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import TaskForm from '../../components/tasks/TaskForm';
import { taskService, homeService } from '../../api/api';

const CreateTask = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch home details
  useEffect(() => {
    const fetchHomeDetails = async () => {
      try {
        setLoading(true);
        const { data } = await homeService.getHomeById(homeId);
        setHome(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch home details:', err);
        setError('Failed to load home details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeDetails();
  }, [homeId]);
  
  // Handle task creation
  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      const { data } = await taskService.createTask(taskData);
      navigate(`/tasks/${data.task_id}`);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Create breadcrumbs
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: home?.home_name || 'Home', path: `/homes/${homeId}` },
    { label: 'Create Task' }
  ];
  
  // Create back button
  const backButton = (
    <Button
      startIcon={<BackIcon />}
      onClick={() => navigate(`/homes/${homeId}`)}
    >
      Back to Home
    </Button>
  );
  
  return (
    <MainLayout>
      <PageHeader 
        title="Create New Task" 
        breadcrumbs={breadcrumbs}
        actionButton={backButton}
      />
      
      <Container maxWidth="md">
        {error && <ErrorDisplay error={error} />}
        
        <TaskForm 
          onSubmit={handleCreateTask}
          homeId={homeId}
          loading={loading}
        />
      </Container>
    </MainLayout>
  );
};

export default CreateTask;