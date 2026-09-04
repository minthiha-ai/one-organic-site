<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            Top Products
        </x-slot>

        @php($products = $this->getTopProducts())

        @if ($products->isEmpty())
            <p class="text-sm text-gray-500 dark:text-gray-400">No sales yet.</p>
        @else
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <th class="pb-2 font-medium">Product</th>
                        <th class="pb-2 font-medium text-right">Quantity Sold</th>
                        <th class="pb-2 font-medium text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($products as $product)
                        <tr class="border-t border-gray-100 dark:border-white/5">
                            <td class="py-2">
                                {{ $product->product_name }}
                                @if ($product->variant_label)
                                    <span class="text-gray-500 dark:text-gray-400">— {{ $product->variant_label }}</span>
                                @endif
                            </td>
                            <td class="py-2 text-right">{{ $product->total_quantity }}</td>
                            <td class="py-2 text-right">฿{{ number_format($product->total_revenue, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
