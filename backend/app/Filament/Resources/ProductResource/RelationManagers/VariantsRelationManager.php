<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Variant')
                    ->schema([
                        Forms\Components\TextInput::make('option_label')
                            ->label('Size / option')
                            ->helperText('e.g. "450ml", "With Castor Oil"')
                            ->required(),
                        Forms\Components\TextInput::make('sku')
                            ->required()
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('price')
                            ->numeric()
                            ->prefix('THB')
                            ->required(),
                        Forms\Components\TextInput::make('compare_at_price')
                            ->numeric()
                            ->prefix('THB')
                            ->helperText('Optional — shown struck through, for sale pricing.'),
                        Forms\Components\TextInput::make('shopee_url')
                            ->label('Shopee URL')
                            ->url()
                            ->helperText('Leave blank to fall back to the product\'s Shopee link.'),
                        Forms\Components\TextInput::make('wholesale_price')
                            ->numeric()
                            ->prefix('THB')
                            ->helperText('Internal — never exposed on the storefront.'),
                        Forms\Components\TextInput::make('barcode')
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('fda_registration_number')
                            ->label('อย / FDA Registration No.')
                            ->helperText('Food products. Enter it as on Shopee, without "อย". It can differ by size (the oil has two numbers).'),
                        Forms\Components\TextInput::make('cosmetic_declaration_number')
                            ->label('เลขที่จดแจ้ง (Declaration No.)')
                            ->helperText('Cosmetic products (soap) — a different registration scheme from the อย number above.'),
                        Forms\Components\TextInput::make('weight_grams')
                            ->label('Weight (g)')
                            ->numeric()
                            ->suffix('g')
                            ->helperText('Packed weight in grams. Shopee shows kilograms: 0.75 kg = 750 g. Used for SHIPPOP rate lookups.'),
                        Forms\Components\TextInput::make('length_cm')
                            ->label('Length (cm)')
                            ->numeric()
                            ->suffix('cm'),
                        Forms\Components\TextInput::make('width_cm')
                            ->label('Width (cm)')
                            ->numeric()
                            ->suffix('cm'),
                        Forms\Components\TextInput::make('height_cm')
                            ->label('Height (cm)')
                            ->numeric()
                            ->suffix('cm'),
                        Forms\Components\TextInput::make('shelf_life_months')
                            ->numeric()
                            ->suffix('months'),
                        Forms\Components\TextInput::make('stock_quantity')
                            ->numeric()
                            ->required()
                            ->default(0),
                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0),
                        Forms\Components\Toggle::make('is_default')
                            ->label('Default variant')
                            ->helperText('Shown first on the shop grid / product page.'),
                        Forms\Components\Toggle::make('is_active')
                            ->default(true),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Shopee listing')
                    ->description('Copied from Shopee on 26.11.19. The Thai text is kept as written and is not shown on the website yet.')
                    ->schema([
                        Forms\Components\TextInput::make('shopee_item_id')
                            ->label('Shopee item ID')
                            ->numeric(),
                        Forms\Components\TextInput::make('shopee_model_id')
                            ->label('Shopee variation (model) ID')
                            ->numeric(),
                        Forms\Components\TextInput::make('name_th')
                            ->label('Thai listing title')
                            ->helperText('Only for products with one Shopee listing per variant (the soaps); the oil and syrup keep theirs on the product.')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('description_th')
                            ->label('Thai description')
                            ->rows(14)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('shopee_attributes')
                            ->label('Other Shopee attributes (JSON)')
                            ->rows(8)
                            ->helperText('Oil type, sugar type, packaging, storage condition, ingredient preference... as listed on Shopee.')
                            ->rule('json')
                            ->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : $state)
                            ->dehydrateStateUsing(fn ($state) => blank($state) ? null : json_decode($state, true))
                            ->columnSpanFull(),
                    ])
                    ->columns(2)
                    ->collapsible()
                    ->collapsed(),

                SpatieMediaLibraryFileUpload::make('image')
                    ->collection('image')
                    ->image()
                    ->imageEditor()
                    ->columnSpanFull(),

                Forms\Components\Section::make('Product page content')
                    ->schema([
                        Forms\Components\TagsInput::make('tags')
                            ->label('Badge tags')
                            ->helperText('Small pills, e.g. "Most Popular", "Cold Pressed", "Vegan & GF"'),
                        Forms\Components\TagsInput::make('highlights')
                            ->helperText('e.g. "Low Moisture & High Purity", "Fast Absorption Into Skin"'),
                        Forms\Components\Repeater::make('usage_items')
                            ->label('Ways to use')
                            ->schema([
                                Forms\Components\TextInput::make('icon')
                                    ->helperText('Tabler icon name, e.g. "ti-flame"')
                                    ->required(),
                                Forms\Components\TextInput::make('label')
                                    ->required(),
                            ])
                            ->columns(2)
                            ->defaultItems(0)
                            ->addActionLabel('Add usage item'),
                        Forms\Components\TagsInput::make('storage_instructions')
                            ->helperText('e.g. "Store in a cool, dry place."'),
                    ])
                    ->columnSpanFull()
                    ->collapsible(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('option_label')
            ->columns([
                Tables\Columns\ImageColumn::make('thumb_url')
                    ->label('Image'),
                Tables\Columns\TextColumn::make('option_label')
                    ->label('Size / option'),
                Tables\Columns\TextColumn::make('sku'),
                Tables\Columns\TextColumn::make('price')
                    ->money('THB'),
                Tables\Columns\TextColumn::make('wholesale_price')
                    ->money('THB')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('barcode')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('fda_registration_number')
                    ->label('อย / FDA No.')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('cosmetic_declaration_number')
                    ->label('Declaration No.')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('shelf_life_months')
                    ->label('Shelf life')
                    ->suffix(' months')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('shopee_item_id')
                    ->label('Shopee item')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('weight_grams')
                    ->label('Weight')
                    ->suffix('g')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('stock_quantity')
                    ->label('Stock')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_default')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
            ])
            ->defaultSort('sort_order')
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
