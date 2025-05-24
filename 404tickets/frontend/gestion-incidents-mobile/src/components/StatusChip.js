import React from 'react';
import { Chip } from 'react-native-paper';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

export const StatusChip = ({ status, style }) => {
  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#2196F3';
  };

  const getStatusLabel = (status) => {
    return STATUS_LABELS[status] || status || 'Inconnu';
  };

  return (
    <Chip
      mode="outlined"
      textStyle={{ color: getStatusColor(status) }}
      style={[
        { borderColor: getStatusColor(status) },
        style
      ]}
    >
      {getStatusLabel(status)}
    </Chip>
  );
};

export default StatusChip; 