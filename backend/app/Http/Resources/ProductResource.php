<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_th' => $this->name_th,
            'slug' => $this->slug,
            'script_eyebrow' => $this->script_eyebrow,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'brand' => $this->brand,
            'country_of_origin' => $this->country_of_origin,
            'shopee_url' => $this->shopee_url,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'price_from' => $this->whenLoaded('variants', fn () => (float) $this->variants->min('price')),
            'default_variant' => $this->whenLoaded('variants', fn () => new ProductVariantResource($this->displayVariant())),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
