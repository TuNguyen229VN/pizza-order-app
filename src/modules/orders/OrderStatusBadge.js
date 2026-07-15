import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ICON_STATUS } from '@/constant/constant';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

export default function OrderStatusBadge({ status, statusList, className = "" }) {
    const sTrans = useTranslations("System");
    const isCancelled = status === "cancelled";
    const displayList = statusList
        ? (isCancelled ? [...statusList, "cancelled"] : statusList)
        : [];
    const currentIdx = isCancelled ? displayList.length - 1 : statusList?.indexOf(status);
    if (!statusList) {
        return (
            <p className={`text-center rounded-lg p-2 line-clamp-1 break-all overflow-hidden font-medium ${ORDER_STATUS_COLORS[status] || 'text-gray-700 bg-gray-200'} ${className}`}>
                {sTrans(ORDER_STATUS_LABELS[status] || status)}
            </p>)
    }
    return (

        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4`}>
            {displayList.length > 0 && displayList.map((item, index) => {
                const { icon: Icon, className: classNameIcon } = ICON_STATUS[item];
                const isCancelNode = item === "cancelled";
                const isActive = isCancelNode ? true : (!isCancelled && currentIdx >= 0 && index <= currentIdx);
                return (
                    <Fragment key={item}>
                        <div className={`md:flex-shrink-0 flex items-center md:flex-col md:justify-center gap-2 md:gap-1`}>
                            <div className={`p-2 rounded-full bg-gray-100 text-gray-500 ${isActive ? classNameIcon : ""}`}>
                                <Icon size={14} />
                            </div>
                            <p className={`md:text-sm ${isActive ? "text-black" : "text-gray-400 italic"}`}>{sTrans(ORDER_STATUS_LABELS[item] || item)}</p>
                        </div>
                        {index < displayList.length - 1 &&
                            <div className={`w-[2px] ml-3 h-8 md:w-full md:h-[2px] ${isCancelled ? 'bg-primary' : (currentIdx >= 0 && index < currentIdx ? 'bg-green-500' : 'bg-gray-200')}`}></div>
                        }
                    </Fragment>
                )
            }
            )}
        </div>

    );
}