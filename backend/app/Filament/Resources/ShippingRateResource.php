<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShippingRateResource\Pages;
use App\Filament\Resources\ShippingRateResource\RelationManagers;
use App\Models\ShippingRate;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ShippingRateResource extends Resource
{
    protected static ?string $model = ShippingRate::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationGroup = 'Settings';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required(),
                Forms\Components\TextInput::make('rate')
                    ->label('Rate (THB)')
                    ->numeric()
                    ->prefix('THB')
                    ->required()
                    ->helperText('Interim flat rate (Phase 0.5.5) — charged on every order until Phase 1.1\'s real SHIPPOP/KEX rate lookup is live, and kept afterward as a fallback if that integration is ever down.'),
                Forms\Components\Toggle::make('is_active')
                    ->required()
                    ->default(true)
                    ->helperText('Checkout uses whichever rate is active. Leave exactly one active — checkout fails rather than silently charging ฿0 if none are.'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('rate')
                    ->money('THB')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageShippingRates::route('/'),
        ];
    }
}
