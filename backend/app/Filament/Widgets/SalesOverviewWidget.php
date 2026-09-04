<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SalesOverviewWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected static bool $isLazy = false;

    protected function getStats(): array
    {
        $thirtyDay = $this->summarize(now()->subDays(30));
        $allTime = $this->summarize(null);

        return [
            Stat::make('Revenue (30 days)', '฿'.number_format($thirtyDay['revenue'], 2)),
            Stat::make('Orders (30 days)', $thirtyDay['count']),
            Stat::make('Avg Order Value (30 days)', '฿'.number_format($thirtyDay['aov'], 2)),
            Stat::make('Revenue (all time)', '฿'.number_format($allTime['revenue'], 2)),
            Stat::make('Orders (all time)', $allTime['count']),
            Stat::make('Avg Order Value (all time)', '฿'.number_format($allTime['aov'], 2)),
        ];
    }

    /**
     * @return array{revenue: float, count: int, aov: float}
     */
    protected function summarize(?\Illuminate\Support\Carbon $since): array
    {
        $row = Order::query()
            ->whereIn('status', OrderStatus::revenueCountingValues())
            ->when($since, fn ($query) => $query->where('created_at', '>=', $since))
            ->selectRaw('COUNT(*) as order_count, COALESCE(SUM(total), 0) as revenue')
            ->first();

        $count = (int) $row->order_count;
        $revenue = (float) $row->revenue;

        return [
            'revenue' => $revenue,
            'count' => $count,
            'aov' => $count > 0 ? $revenue / $count : 0.0,
        ];
    }
}
