// AI Assistant Chat Widget
'use client';

import React from 'react';

interface AIAssistantWidgetProps {
  userId?: string;
  initialOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

export function AIAssistantWidget({
  userId = 'anonymous',
  initialOpen = false,
  position = 'bottom-right',
  theme = 'dark',
}: AIAssistantWidgetProps) {
  return null;
}
