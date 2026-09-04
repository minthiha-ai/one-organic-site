<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\OrderItem;
use Filament\Widgets\Widget;

class TopProductsWidget extends Widget
{
    protected static ?int $sort = 3;

    protected static bool $isLazy = false;

    protected int | string | array $columnSpan = 'full';

    protected static string $view = 'filament.widgets.top-products';

    /**
     * Grouped on OrderItem's own snapshot fields, never joined to the live
     * Product/ProductVariant tables — order items deliberately denormalize
     * product_name/variant_label so historical orders never change if a
     * product is later edited, repriced, or deleted.
     */
    public function getTopProducts(): \Illuminate\Support\Collection
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', OrderStatus::revenueCountingValues())
            ->selectRaw('order_items.product_name, order_items.variant_label,
                         SUM(order_items.quantity) as total_quantity,
                         SUM(order_items.line_total) as total_revenue')
            ->groupBy('order_items.product_name', 'order_items.variant_label')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();
    }
}
