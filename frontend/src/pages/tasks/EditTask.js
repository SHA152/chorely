// src/pages/tasks/EditTask.js
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
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import TaskForm from '../../components/tasks/TaskForm';
import { taskService } from '../../api/api';

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const { data } = await taskService.getTaskById(taskId);
        setTask(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch task details:', err);
        setError('Failed to load task details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [taskId]);
  
  // Handle task update
  const handleUpdateTask = async (taskData) => {
    try {
      setLoading(true);
      await taskService.updateTask(taskId, taskData);
      navigate(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Create breadcrumbs
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: 'Tasks', path: `/homes/${task?.home_id}/tasks` },
    { label: task?.task_name || 'Task', path: `/tasks/${taskId}` },
    { label: 'Edit' }
  ];
  
  // Create back button
  const backButton = (
    <Button
      startIcon={<BackIcon />}
      onClick={() => navigate(`/tasks/${taskId}`)}
    >
      Back to Task
    </Button>
  );
  
  if (loading && !task) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading task details..." />
      </MainLayout>
    );
  }
  
  if (error && !task) {
    return (
      <MainLayout>
        <ErrorDisplay error={error} />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader 
        title={`Edit Task: ${task?.task_name}`} 
        breadcrumbs={breadcrumbs}
        actionButton={backButton}
      />
      
      <Container maxWidth="md">
        {error && <ErrorDisplay error={error} />}
        
        <TaskForm 
          initialValues={task}
          onSubmit={handleUpdateTask}
          homeId={task?.home_id}
          isEditing={true}
          loading={loading}
        />
      </Container>
    </MainLayout>
  );
};

export default EditTask;