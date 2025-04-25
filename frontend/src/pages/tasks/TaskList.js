// src/pages/tasks/TaskList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Button, Paper, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import TaskCard from '../../components/tasks/TaskCard';
import { taskService, homeService } from '../../api/api';
import { EmptyState } from '../../components/common/EmptyState';

const TaskList = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();

  const [home, setHome] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchHomeDetails = useCallback(async (id) => {
    try {
      const { data } = await homeService.getHomeById(id);
      setHome(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch home details:', err);
      setError('Failed to load home details. Please try again.');
    }
  }, []);

  const fetchHomeTasks = useCallback(async (id) => {
    try {
      const { data } = await taskService.getHomeTasks(id);
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again.');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!homeId) {
        setError('Invalid home ID. Please select a valid home.');
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([fetchHomeDetails(homeId), fetchHomeTasks(homeId)]);
      setLoading(false);
    };

    loadData();
  }, [homeId, fetchHomeDetails, fetchHomeTasks]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleCreateTask = () => navigate(`/homes/${homeId}/create-task`);

  const handleCompleteTask = (task) => navigate(`/tasks/${task.task_id}`);

  const getFilteredTasks = useCallback(() => {
    switch (activeTab) {
      case 1:
        return tasks.filter((task) => task.status === 'pending');
      case 2:
        return tasks.filter((task) => task.status === 'completed');
      case 3:
        return tasks.filter((task) => task.is_assigned_to_me);
      case 4:
        return tasks.filter((task) => !task.assigned_user_id);
      default:
        return tasks;
    }
  }, [tasks, activeTab]);

  const filteredTasks = getFilteredTasks();

  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: home?.home_name || 'Home', path: `/homes/${homeId}` },
    { label: 'Tasks' },
  ];

  const actionButtons = (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/homes/${homeId}`)} sx={{ mr: 1 }}>
        Back to Home
      </Button>

      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateTask}>
        Create Task
      </Button>
    </Box>
  );

  if (loading && !home) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading tasks..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title={`${home?.home_name || 'Home'} Tasks`} breadcrumbs={breadcrumbs} actionButton={actionButtons} />

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All Tasks" />
          <Tab label="Pending" />
          <Tab label="Completed" />
          <Tab label="My Tasks" />
          <Tab label="Unassigned" />
        </Tabs>

        <Box p={3}>
          {error ? (
            <ErrorDisplay error={error} />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description={
                activeTab === 0
                  ? "This home doesn't have any tasks yet. Create your first task!"
                  : "No tasks match the selected filter."
              }
              actionLabel={activeTab === 0 ? "Create Task" : null}
              actionHandler={activeTab === 0 ? handleCreateTask : null}
            />
          ) : (
            <Grid container spacing={3}>
              {filteredTasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.task_id}>
                  <TaskCard task={task} onComplete={handleCompleteTask} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default TaskList;
