<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('product_variant_id')
                    ->relationship('productVariant', 'sku')
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('product_name')->required(),
                Forms\Components\TextInput::make('variant_label')->required(),
                Forms\Components\TextInput::make('sku')->required(),
                Forms\Components\TextInput::make('unit_price')->numeric()->prefix('THB')->required(),
                Forms\Components\TextInput::make('quantity')->numeric()->required()->default(1),
            ])
            ->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('product_name')
            ->columns([
                Tables\Columns\TextColumn::make('product_name'),
                Tables\Columns\TextColumn::make('variant_label'),
                Tables\Columns\TextColumn::make('sku'),
                Tables\Columns\TextColumn::make('unit_price')->money('THB'),
                Tables\Columns\TextColumn::make('quantity'),
                Tables\Columns\TextColumn::make('line_total')->money('THB'),
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
