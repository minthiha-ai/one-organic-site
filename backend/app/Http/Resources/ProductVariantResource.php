<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'option_label' => $this->option_label,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'shopee_url' => $this->shopee_url,
            'in_stock' => $this->inStock(),
            'stock_quantity' => $this->stock_quantity,
            'is_default' => $this->is_default,
            'image_url' => $this->image_url,
            'thumb_url' => $this->thumb_url,
            'tags' => $this->tags ?? [],
            'highlights' => $this->highlights ?? [],
            'usage_items' => $this->usage_items ?? [],
            'storage_instructions' => $this->storage_instructions ?? [],
            'lather' => $this->lather,
            'skin_type' => $this->skin_type,
            'moisturizing_strength' => $this->moisturizing_strength,
            'ingredients' => $this->ingredients,
        ];
    }
}
