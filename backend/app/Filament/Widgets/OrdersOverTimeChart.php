<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\Order;
use Filament\Widgets\LineChartWidget;

class OrdersOverTimeChart extends LineChartWidget
{
    protected static ?string $heading = 'Orders Over Time';

    protected static ?int $sort = 2;

    protected static bool $isLazy = false;

    protected int | string | array $columnSpan = 'full';

    public ?string $filter = '30';

    protected function getFilters(): ?array
    {
        return [
            '7' => 'Last 7 days',
            '30' => 'Last 30 days',
            '90' => 'Last 90 days',
            'all' => 'All time',
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $since = $this->filter === 'all' ? null : now()->subDays((int) $this->filter);

        // Volume counts every order regardless of status — a real
        // ops/pipeline signal, distinct from revenue.
        $volumeRows = Order::query()
            ->when($since, fn ($query) => $query->where('created_at', '>=', $since))
            ->selectRaw('DATE(created_at) as day, COUNT(*) as order_count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $revenueRows = Order::query()
            ->whereIn('status', OrderStatus::revenueCountingValues())
            ->when($since, fn ($query) => $query->where('created_at', '>=', $since))
            ->selectRaw('DATE(created_at) as day, COALESCE(SUM(total), 0) as revenue')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $days = $volumeRows->keys()->merge($revenueRows->keys())->unique()->sort()->values();

        return [
            'datasets' => [
                [
                    'label' => 'Orders',
                    'data' => $days->map(fn ($day) => (int) ($volumeRows[$day]->order_count ?? 0))->all(),
                    'borderColor' => '#c87815',
                ],
                [
                    'label' => 'Revenue (฿)',
                    'data' => $days->map(fn ($day) => (float) ($revenueRows[$day]->revenue ?? 0))->all(),
                    'borderColor' => '#58392a',
                ],
            ],
            'labels' => $days->all(),
        ];
    }
}
