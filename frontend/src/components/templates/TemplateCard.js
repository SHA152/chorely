// src/components/templates/TemplateCard.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AccessTime as TimeIcon,
  Autorenew as RepeatIcon,
  ContentCopy as UseTemplateIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * TemplateCard displays a task template with options to use it
 */
const TemplateCard = ({ 
  template, 
  onUseTemplate, 
  onViewDetails 
}) => {
  // Format difficulty and determine color
  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'primary';
      case 'Hard':
        return 'error';
      default:
        return 'primary';
    }
  };
  
  // Format estimated time
  const formatEstimatedTime = (minutes) => {
    if (!minutes) return 'N/A';
    
    if (minutes < 60) {
      return `${minutes} mins`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      
      if (remainingMins === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `${hours}h ${remainingMins}m`;
      }
    }
  };
  
  // Format repeat interval
  const formatRepeatInterval = (interval) => {
    if (!interval) return 'One-time';
    
    switch(interval) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      default:
        if (interval.includes('days')) {
          return interval;
        }
        return `Every ${interval}`;
    }
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="h2" gutterBottom>
            {template.template_name}
          </Typography>
          
          <Chip 
            label={`${template.points} pts`}
            size="small"
            color="secondary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Chip 
            label={template.difficulty_level}
            size="small"
            color={getDifficultyColor(template.difficulty_level)}
            sx={{ mr: 1 }}
          />
          
          <Chip 
            label={template.category}
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {template.description || 'No description'}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Est. Time: {formatEstimatedTime(template.estimated_time)}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center">
          <RepeatIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Repeat: {formatRepeatInterval(template.repeat_interval)}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Tooltip title="View details">
            <IconButton 
              size="small" 
              onClick={() => onViewDetails(template)}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Button 
            size="small" 
            variant="contained"
            color="primary"
            startIcon={<UseTemplateIcon />}
            onClick={() => onUseTemplate(template)}
          >
            Use Template
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default TemplateCard;