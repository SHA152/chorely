// src/components/templates/CategoryIcon.js
import React from 'react';
import {
  Kitchen as KitchenIcon,
  Weekend as LivingRoomIcon,
  Bathtub as BathroomIcon,
  Yard as OutdoorIcon,
  LocalLaundryService as LaundryIcon,
  Pets as PetsIcon,
  AutoStories as StudyIcon,
  MeetingRoom as BedroomIcon,
  Garage as GarageIcon,
  ShoppingCart as ShoppingIcon,
  Payment as BillsIcon,
  AutoDelete as TrashIcon,
  Category as DefaultIcon
} from '@mui/icons-material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

/**
 * CategoryIcon component maps category names to appropriate icon components
 */
export const CategoryIcon = ({ category = 'default' }) => {
  const lowerCategory = category.toLowerCase();
  
  switch (lowerCategory) {
    case 'kitchen':
      return <KitchenIcon />;
    case 'living room':
    case 'livingroom':
      return <LivingRoomIcon />;
    case 'bathroom':
      return <BathroomIcon />;
    case 'outdoor':
    case 'yard':
    case 'garden':
      return <OutdoorIcon />;
    case 'laundry':
      return <LaundryIcon />;
    case 'pets':
      return <PetsIcon />;
    case 'study':
    case 'office':
      return <StudyIcon />;
    case 'bedroom':
      return <BedroomIcon />;
    case 'garage':
      return <GarageIcon />;
    case 'shopping':
      return <ShoppingIcon />;
    case 'bills':
    case 'finances':
      return <BillsIcon />;
    case 'trash':
    case 'garbage':
      return <TrashIcon />;
    case 'cleaning':
      return <CleaningIcon />;
    case 'all':
      return <DefaultIcon />;
    default:
      return <DefaultIcon />;
  }
};
