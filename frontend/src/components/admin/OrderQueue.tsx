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
import OrderStatusWidget from './OrderStatusWidget';
import { ListFilter, SortAsc, SortDesc, CheckSquare, Square, Clock, AlertCircle, CheckCircle, Users, Filter } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (orderId: string) => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
  onPriorityChange: (orderId: string, newPriority: number) => void;
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
  } = useSortable({ id: order.id, data: { status: order.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: attributes['aria-pressed'] ? 0.6 : 1,
  };

  const handlePriorityChangeClick = (currentPriority: string | number | undefined, change: number) => {
    const numericPriority = typeof currentPriority === 'string' ? parseInt(currentPriority, 10) : (currentPriority || 0);
    if (!isNaN(numericPriority)) {
        onPriorityChange(order.id, numericPriority + change);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white rounded-lg shadow-md border ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
      } hover:shadow-lg transition-shadow duration-150 ease-in-out`}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-gray-800 truncate" title={order.id}>Order #{order.id.substring(0, 8)}...</h3>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            order.priority === 'urgent' ? 'bg-red-500 text-white' :
            order.priority === 'normal' ? 'bg-yellow-400 text-gray-800' :
            order.priority === 'low' ? 'bg-green-500 text-white' :
            'bg-gray-300 text-gray-700'
          }`}>
            {order.priority ? order.priority.toUpperCase() : 'NORMAL'}
          </span>
        </div>
        <p className="text-sm text-gray-700">{order.customer_name || 'Guest'} - {order.customer_phone}</p>
        <p className="text-sm text-gray-500">Total: Rs. {order.total_amount.toFixed(2)}</p>
        <p className="text-xs text-gray-500">Rec: {new Date(order.created_at).toLocaleTimeString()}</p>
      </div>

      <div className="mt-2 flex items-center space-x-2">
        <OrderStatusWidget
            orderId={order.id}
            currentStatus={order.status}
            onStatusChange={(newStatus) => onStatusUpdate(order.id, newStatus)}
        />
        <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleSelect(order.id)}
            className={`${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
            {isSelected ? 'Deselect' : 'Select'}
        </Button>
      </div>
      <div className="mt-2 flex items-center space-x-1">
        <Button size="sm" variant="ghost" onClick={() => handlePriorityChangeClick(order.priority, 1)} title="Increase Priority">↑ Prio</Button>
        <Button size="sm" variant="ghost" onClick={() => handlePriorityChangeClick(order.priority, -1)} title="Decrease Priority">↓ Prio</Button>
      </div>
    </div>
  );
};

interface OrderQueueProps {
  orders: Order[];
  isLoading: boolean;
  onPriorityChange: (orderId: string, priority: number) => void;
}

const statusColumns = [
  { id: 'received', title: 'New Orders' },
  { id: 'confirmed', title: 'Confirmed' },
  { id: 'preparing', title: 'Preparing' },
  { id: 'ready_for_pickup', title: 'Ready For Pickup' }
];

const OrderQueue: React.FC<OrderQueueProps> = ({ orders, isLoading, onPriorityChange }) => {
  const {
    selectedOrders,
    toggleOrderSelection,
    clearSelection,
    updateAdminOrderStatus,
  } = useAdminStore((state) => ({
    selectedOrders: state.selectedOrders,
    toggleOrderSelection: state.toggleOrderSelection,
    clearSelection: state.clearSelection,
    updateAdminOrderStatus: state.updateAdminOrderStatus,
  }));

  const [statusFilter, setStatusFilter] = React.useState<Order['status'] | 'all'>('all');
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest' | 'priority_high' | 'priority_low'>('newest');

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

  const handleIndividualOrderStatusUpdate = async (orderId: string, status: Order['status']) => {
    await updateAdminOrderStatus(orderId, status);
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

  const getPriorityValue = (priority?: Order['priority']): number => {
    if (priority === 'urgent') return 3;
    if (priority === 'normal') return 2;
    if (priority === 'low') return 1;
    return 0; // Default for undefined or unexpected
  };

  const processedOrders = React.useMemo(() => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'priority_high':
        filtered.sort((a, b) => getPriorityValue(b.priority) - getPriorityValue(a.priority));
        break;
      case 'priority_low':
        filtered.sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority));
        break;
    }
    return filtered;
  }, [orders, statusFilter, sortOrder]);

  const ordersByStatus = processedOrders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        {/* Header with stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Queue: {processedOrders.length} orders</span>
            </div>
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">{selectedOrders.length} selected</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const allOrderIds = processedOrders.map(o => o.id);
                const { selectAllOrders, clearSelection } = useAdminStore.getState();
                if (selectedOrders.length === allOrderIds.length) {
                  clearSelection();
                } else {
                  selectAllOrders();
                }
              }}
              variant="outline"
              size="sm"
            >
              {selectedOrders.length === processedOrders.length ? (
                <>
                  <Square className="w-4 h-4 mr-1" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600"/>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                className="bg-white border border-gray-300 rounded-md shadow-sm text-sm px-3 py-1"
              >
                <option value="all">All Active Statuses</option>
                <option value="received">Received</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {sortOrder === 'newest' || sortOrder === 'priority_low' ?
                <SortAsc className="w-4 h-4 text-gray-600"/> :
                <SortDesc className="w-4 h-4 text-gray-600"/>
              }
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                className="bg-white border border-gray-300 rounded-md shadow-sm text-sm px-3 py-1"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority_high">Priority (High to Low)</option>
                <option value="priority_low">Priority (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleBulkStatusUpdate('confirmed')}
              disabled={selectedOrders.length === 0 || bulkUpdateMutation.isLoading}
              variant="outline"
              size="sm"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              Confirm Selected
            </Button>
            <Button
              onClick={() => handleBulkStatusUpdate('preparing')}
              disabled={selectedOrders.length === 0 || bulkUpdateMutation.isLoading}
              variant="outline"
              size="sm"
            >
              <Clock className="w-4 h-4 mr-1" />
              Start Preparing
            </Button>
            <Button
              onClick={() => handleBulkStatusUpdate('ready_for_pickup')}
              disabled={selectedOrders.length === 0 || bulkUpdateMutation.isLoading}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Ready
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column) => {
          const ordersInColumn = processedOrders.filter(order => order.status === column.id);
          return (
            <div key={column.id} className="bg-gray-100 rounded-lg p-4 min-h-[200px]">
              <h3 className="font-semibold text-lg mb-4 text-gray-700">{column.title} ({ordersInColumn.length})</h3>
              <DropTarget id={column.id} status={column.id as Order['status']}>
                <SortableContext items={ordersInColumn.map(o => o.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {ordersInColumn.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isSelected={selectedOrders.includes(order.id)}
                        onToggleSelect={toggleOrderSelection}
                        onStatusUpdate={handleIndividualOrderStatusUpdate}
                        onPriorityChange={handlePriorityChangeLocal}
                      />
                    ))}
                    {ordersInColumn.length === 0 && <p className="text-sm text-gray-500 italic">No orders in this stage.</p>}
                  </div>
                </SortableContext>
              </DropTarget>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
};

export default OrderQueue;
