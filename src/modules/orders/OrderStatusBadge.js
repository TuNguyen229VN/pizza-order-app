import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constant/constant';
import { useTranslations } from 'next-intl';

export default function OrderStatusBadge({ status, className = "" }) {
    const sTrans = useTranslations("System");
    return (
        <p className={`text-center rounded-lg p-2 line-clamp-1 break-all overflow-hidden font-medium ${ORDER_STATUS_COLORS[status] || 'text-gray-700 bg-gray-200'} ${className}`}>
            {sTrans(ORDER_STATUS_LABELS[status] || status)}
        </p>
    );
}