// src/components/layout/MainLayout.js
import React, { useState, useEffect } from 'react';
import { 
  AppBar, Box, Drawer, IconButton, Toolbar, Typography, List,
  ListItem, ListItemIcon, ListItemText, Badge, Avatar, Menu, MenuItem,
  Divider, useMediaQuery, useTheme, Container
} from '@mui/material';
import { 
  Menu as MenuIcon, Home as HomeIcon, Task as TaskIcon,
  Notifications as NotificationsIcon, AccountCircle as ProfileIcon, 
  Category as TemplateIcon, ExitToApp as LogoutIcon,
  PersonAdd as JoinRequestIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../api/api';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleDrawer = () => setMobileOpen(prev => !prev);

  const openProfileMenu = (e) => setAnchorEl(e.currentTarget);
  const closeProfileMenu = () => setAnchorEl(null);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const { data } = await notificationService.getUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Notification fetch error:', error);
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'My Homes', icon: <HomeIcon />, path: '/homes' },
    { text: 'Task Templates', icon: <TemplateIcon />, path: '/templates' },
    { text: 'My Tasks', icon: <TaskIcon />, path: '/homes' }, // Redirecting to home selection
    { text: 'Join Requests', icon: <JoinRequestIcon />, path: '/home-requests' },
  ];

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Chorely</Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItem
            button
            key={text}
            selected={location.pathname === path}
            onClick={() => handleNavigation(path)}
            sx={{
              '&.Mui-selected': {
                bgcolor: `${theme.palette.primary.light}20`,
                borderRight: `3px solid ${theme.palette.primary.main}`,
              },
              '&:hover': { bgcolor: `${theme.palette.primary.light}15` },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === path ? theme.palette.primary.main : 'inherit' }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={text}
              primaryTypographyProps={{
                fontWeight: location.pathname === path ? 'bold' : 'normal',
                color: location.pathname === path ? theme.palette.primary.main : 'inherit',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ bgcolor: '#ffffff', color: theme.palette.text.primary }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>Chorely</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={() => handleNavigation('/notifications')}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={openProfileMenu}>
            <Avatar src={user?.avatar_id ? `/uploads/images/${user.avatar_id}` : null}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeProfileMenu}>
        <MenuItem onClick={() => handleNavigation('/profile')}><ProfileIcon /> Profile</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}><LogoutIcon /> Logout</MenuItem>
      </Menu>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, bgcolor: theme.palette.background.default }}>
        <Toolbar />
        <Container>{children}</Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
