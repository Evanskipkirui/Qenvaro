import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

// Maps each order status to a color class
const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'status-pending' },
  processing: { label: 'Processing', className: 'status-processing' },
  shipped:    { label: 'Shipped',    className: 'status-shipped' },
  delivered:  { label: 'Delivered',  className: 'status-delivered' },
  cancelled:  { label: 'Cancelled',  className: 'status-cancelled' },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
