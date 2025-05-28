import React from 'react';
import { Order } from '@/types/shared';
import { useAdminStore } from '@/stores/adminStore';
import { useBulkUpdateOrders } from '@/hooks/useAdmin';
import Button from '@/components/ui/Button';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DropTarget } from './DropTarget';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (orderId: string) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onPriorityChange?: (orderId: string, newPriority: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected,
  onToggleSelect,
  onStatusUpdate,
  onPriorityChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 bg-white rounded-lg shadow-sm border ${
        isSelected ? 'border-primary' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
          <p className="text-gray-600">{order.status}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleSelect(order.id)}
            className={`p-2 rounded ${
              isSelected ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
          <select
            value={order.status}
            onChange={(e) => onStatusUpdate(order.id, e.target.value)}
            className="p-2 border rounded"
          >
            <option value="received">Received</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface OrderQueueProps {
  orders: Order[];
  isLoading: boolean;
  onPriorityChange?: (orderId: string, priority: number) => void;
}

const statusColumns = [
  { id: 'received', title: 'New Orders' },
  { id: 'preparing', title: 'Preparing' },
  { id: 'ready_for_pickup', title: 'Ready' }
];

const OrderQueue: React.FC<OrderQueueProps> = ({ orders, isLoading, onPriorityChange }) => {
  const {
    selectedOrders,
    toggleOrderSelection,
    clearSelection,
  } = useAdminStore();
  
  const bulkUpdateMutation = useBulkUpdateOrders();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current?.status !== over.id) {
      bulkUpdateMutation.mutate({
        orderIds: [active.id as string],
        status: over.id as string,
        estimated_pickup_time: over.id === 'ready_for_pickup'
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
          : undefined
      });
    }
  };

  const handleStatusUpdate = (orderId: string, status: string) => {
    bulkUpdateMutation.mutate({
      orderIds: [orderId],
      status,
      estimated_pickup_time: status === 'ready_for_pickup'
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : undefined
    });
  };

  const handlePriorityChangeLocal = (orderId: string, priority: number) => {
    if (onPriorityChange) {
      onPriorityChange(orderId, priority);
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedOrders.length === 0) return;

    bulkUpdateMutation.mutate({
      orderIds: selectedOrders,
      status,
      estimated_pickup_time: status === 'ready_for_pickup'
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : undefined
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column) => (
          <div key={column.id} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">{column.title}</h3>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex space-x-3">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ordersByStatus: Record<string, Order[]> = {
    received: [],
    preparing: [],
    ready_for_pickup: []
  };

  orders.forEach(order => {
    if (ordersByStatus[order.status]) {
      ordersByStatus[order.status].push(order);
    }
  });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map(column => (
          <div key={column.id} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">{column.title} ({ordersByStatus[column.id]?.length || 0})</h3>
            <DropTarget id={column.id}>
              <SortableContext items={ordersByStatus[column.id] || []} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {ordersByStatus[column.id]?.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrders.includes(order.id)}
                      onToggleSelect={() => toggleOrderSelection(order.id)}
                      onStatusUpdate={handleStatusUpdate}
                      onPriorityChange={handlePriorityChangeLocal}
                    />
                  ))}
                </div>
              </SortableContext>
            </DropTarget>
          </div>
        ))}
      </div>

      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedOrders.length} orders selected
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusUpdate('preparing')}
                disabled={bulkUpdateMutation.isLoading}
              >
                Start Preparing
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusUpdate('ready_for_pickup')}
                disabled={bulkUpdateMutation.isLoading}
              >
                Mark Ready
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
};

export default OrderQueue;
