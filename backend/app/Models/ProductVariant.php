<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProductVariant extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'product_id',
        'sku',
        'option_label',
        'price',
        'compare_at_price',
        'shopee_url',
        'wholesale_price',
        'barcode',
        'fda_registration_number',
        'cosmetic_declaration_number',
        'weight_grams',
        'length_cm',
        'width_cm',
        'height_cm',
        'stock_quantity',
        'is_default',
        'sort_order',
        'tags',
        'highlights',
        'usage_items',
        'storage_instructions',
        'lather',
        'skin_type',
        'moisturizing_strength',
        'ingredients',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
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

    /**
     * The original upload is kept untouched but never served: the admin
     * accepts full-size camera photos (the live soap shots are 6240px wide,
     * ~1.9 MB each), which the storefront would otherwise ship to every
     * visitor. Two shrunken copies are generated instead — `thumb` for shop
     * cards, `detail` for the product page, schema.org and share previews.
     *
     * Fit::Max shrinks to fit inside the box and never upscales a small
     * source. Queued (the default), so an upload isn't held up — or made to
     * fail — by image processing; until a copy exists, getFirstMediaUrl()
     * falls back to the original URL, so nothing breaks in the meantime.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        foreach (['thumb' => [640, 80], 'detail' => [1000, 82]] as $name => [$box, $quality]) {
            $conversion = $this->addMediaConversion($name)
                ->performOnCollections('image')
                ->fit(Fit::Max, $box, $box)
                ->quality($quality);

            // WebP keeps transparency (the jar photos are transparent PNGs)
            // at a fraction of the bytes. Skipped on a server whose image
            // driver can't encode it: without format() the conversion keeps
            // the source's own format, still resized — a failed encode would
            // otherwise leave no copy at all.
            if (self::canEncodeWebp()) {
                $conversion->format('webp');
            }
        }
    }

    private static function canEncodeWebp(): bool
    {
        if (config('media-library.image_driver') === 'imagick') {
            return extension_loaded('imagick') && \Imagick::queryFormats('WEBP') !== [];
        }

        return function_exists('imagewebp') && (gd_info()['WebP Support'] ?? false);
    }

    // Detail-size copy; the full original if it hasn't been generated yet.
    public function getImageUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('image', 'detail') ?: null;
    }

    public function getThumbUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('image', 'thumb') ?: null;
    }

    public function inStock(): bool
    {
        return $this->stock_quantity > 0;
    }
}
