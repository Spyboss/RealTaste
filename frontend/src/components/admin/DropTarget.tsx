import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropTargetProps {
  id: string;
  children: React.ReactNode;
}

export const DropTarget: React.FC<DropTargetProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] ${isOver ? 'bg-blue-50' : ''}`}
    >
      {children}
    </div>
  );
};