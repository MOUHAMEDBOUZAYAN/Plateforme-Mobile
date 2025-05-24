import React from 'react';
import { Chip } from 'react-native-paper';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../constants';

export const PriorityChip = ({ priority, style }) => {
  const getPriorityColor = (priority) => {
    return PRIORITY_COLORS[priority] || '#2196F3';
  };

  const getPriorityLabel = (priority) => {
    return PRIORITY_LABELS[priority] || priority || 'Inconnu';
  };

  return (
    <Chip
      mode="outlined"
      textStyle={{ color: getPriorityColor(priority) }}
      style={[
        { borderColor: getPriorityColor(priority) },
        style
      ]}
    >
      {getPriorityLabel(priority)}
    </Chip>
  );
};

export default PriorityChip; 