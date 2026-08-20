<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ProductVariant extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'product_id',
        'sku',
        'option_label',
        'price',
        'compare_at_price',
        'stock_quantity',
        'is_default',
        'sort_order',
        'tags',
        'highlights',
        'usage_items',
        'storage_instructions',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'tags' => 'array',
        'highlights' => 'array',
        'usage_items' => 'array',
        'storage_instructions' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')->singleFile();
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('image') ?: null;
    }

    public function inStock(): bool
    {
        return $this->stock_quantity > 0;
    }
}
