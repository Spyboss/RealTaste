import React, { useState } from 'react';
import { Clock, Package, CheckCircle, Phone, MoreVertical, Menu, Star, ChevronDown } from 'lucide-react';
import { Order } from '@/types/shared';
import { formatPrice, formatDateTime, getOrderStatusColor } from '@/utils/tempUtils';
import { useAdminStore } from '@/stores/adminStore';
import { useBulkUpdateOrders } from '@/hooks/useAdmin';
import Button from '@/components/ui/Button';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DropTarget } from './DropTarget';

interface OrderQueueProps {
  orders: Order[];
  isLoading: boolean;
  onPriorityChange?: (orderId: string, priority: string) => void;
}

const statusColumns = [
  { id: 'received', title: 'New Orders' },
  { id: 'preparing', title: 'Preparing' },
  { id: 'ready_for_pickup', title: 'Ready' }
];

const priorityOptions = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' }
];

const getPriorityBadge = (priority: string) => {
  const option = priorityOptions.find(opt => opt.value === priority) || priorityOptions[1];
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
      <Star className="w-3 h-3 mr-1" />
      {option.label}
    </span>
  );
};

const SortableOrderCard = React.forwardRef<HTMLDivElement, {
  order: Order;
  isSelected: boolean;
  onToggleSelect: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  onPriorityChange: (orderId: string, priority: string) => void;
}>(({ order, isSelected, onToggleSelect, onStatusUpdate, onPriorityChange }, ref) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
  const [showActions, setShowActions] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
              </span>
              {getPriorityBadge(order.priority || 'normal')}
              <span className="text-xs text-gray-500">
                {formatDateTime(order.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(order.total_amount)}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onStatusUpdate(order.id, getNextStatus(order.status));
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {getNextStatusLabel(order.status)}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                      className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span>Set Priority</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showPriorityMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showPriorityMenu && (
                      <div className="absolute left-full top-0 ml-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                        {priorityOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onPriorityChange(order.id, option.value);
                              setShowPriorityMenu(false);
                              setShowActions(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onStatusUpdate(order.id, 'cancelled');
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute left-4 top-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Menu className="w-4 h-4 text-gray-400" />
      </div>

      {/* Customer Info */}
      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4" />
          <span>{order.customer_phone}</span>
        </div>
        {order.customer_name && (
          <span>{order.customer_name}</span>
        )}
      </div>

      {/* Order Items */}
      <div className="space-y-2">
        {order.order_items?.slice(0, 3).map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.quantity}x {item.menu_item?.name}
              {item.variant && ` (${item.variant.name})`}
            </span>
            <span className="text-gray-900 font-medium">
              {formatPrice(item.total_price)}
            </span>
          </div>
        ))}
        {order.order_items && order.order_items.length > 3 && (
          <div className="text-xs text-gray-500">
            +{order.order_items.length - 3} more items
          </div>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-gray-700">
          <strong>Note:</strong> {order.notes}
        </div>
      )}
    </div>
  );
});

const OrderQueue: React.FC<OrderQueueProps> = ({ orders, isLoading, onPriorityChange }) => {
  const { selectedOrders, toggleOrderSelection, selectAllOrders, clearSelection } = useAdminStore();
  const bulkUpdateMutation = useBulkUpdateOrders();
  const [showActions, setShowActions] = useState(false);
  
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

  const handlePriorityChange = (orderId: string, priority: string) => {
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

  // Group orders by status
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
                    <SortableOrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrders.includes(order.id)}
                      onToggleSelect={() => toggleOrderSelection(order.id)}
                      onStatusUpdate={handleStatusUpdate}
                      onPriorityChange={handlePriorityChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DropTarget>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'received':
      return <Clock className="w-4 h-4" />;
    case 'preparing':
      return <Package className="w-4 h-4" />;
    case 'ready_for_pickup':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case 'received':
      return 'preparing';
    case 'preparing':
      return 'ready_for_pickup';
    default:
      return currentStatus;
  }
};

const getNextStatusLabel = (currentStatus: string) => {
  switch (currentStatus) {
    case 'received':
      return 'Start Preparing';
    case 'preparing':
      return 'Mark Ready';
    default:
      return 'Update';
  }
};

export default OrderQueue;
