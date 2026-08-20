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
                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Image'),
                Tables\Columns\TextColumn::make('option_label')
                    ->label('Size / option'),
                Tables\Columns\TextColumn::make('sku'),
                Tables\Columns\TextColumn::make('price')
                    ->money('THB'),
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
