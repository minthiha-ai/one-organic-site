<?php

namespace App\Filament\Resources;

use App\Enums\OrderStatus;
use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers\ItemsRelationManager;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Sales';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Order')
                    ->schema([
                        Forms\Components\TextInput::make('order_number')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\Select::make('status')
                            ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()]))
                            ->required(),
                        Forms\Components\Select::make('customer_id')
                            ->relationship('customer', 'email')
                            ->searchable()
                            ->preload()
                            ->helperText('Leave blank for a guest order.'),
                        Forms\Components\TextInput::make('guest_name')
                            ->label('Customer name')
                            ->required(),
                        Forms\Components\TextInput::make('guest_email')
                            ->label('Customer email')
                            ->email()
                            ->required(),
                        Forms\Components\TextInput::make('guest_phone')
                            ->label('Customer phone')
                            ->tel(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Shipping address')
                    ->schema([
                        Forms\Components\TextInput::make('shipping_recipient_name')->required(),
                        Forms\Components\TextInput::make('shipping_phone')->tel()->required(),
                        Forms\Components\TextInput::make('shipping_line1')->required()->columnSpanFull(),
                        Forms\Components\TextInput::make('shipping_line2')->columnSpanFull(),
                        Forms\Components\TextInput::make('shipping_city')->required(),
                        Forms\Components\TextInput::make('shipping_state'),
                        Forms\Components\TextInput::make('shipping_postal_code')->required(),
                        Forms\Components\TextInput::make('shipping_country')->default('TH')->maxLength(2)->required(),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Forms\Components\Section::make('Totals')
                    ->schema([
                        Forms\Components\TextInput::make('currency')->default('THB')->maxLength(3)->required(),
                        Forms\Components\TextInput::make('subtotal')->numeric()->prefix('THB')->required(),
                        Forms\Components\TextInput::make('shipping_cost')->numeric()->prefix('THB')->default(0)->required(),
                        Forms\Components\TextInput::make('discount_total')->numeric()->prefix('THB')->default(0)->required(),
                        Forms\Components\TextInput::make('total')->numeric()->prefix('THB')->required(),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Forms\Components\Section::make('Payment')
                    ->schema([
                        Forms\Components\TextInput::make('payment_method'),
                        Forms\Components\TextInput::make('payment_reference'),
                    ])
                    ->columns(2)
                    ->collapsed(),

                Forms\Components\Section::make('Shipment')
                    ->description('Managed via the Prepare/Confirm/Cancel shipment actions above — not editable directly.')
                    ->schema([
                        Forms\Components\TextInput::make('shipment_status')
                            ->label('SHIPPOP status')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\TextInput::make('shippop_tracking_code')
                            ->label('SHIPPOP tracking code')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\TextInput::make('courier_tracking_code')
                            ->label('KEX tracking code')
                            ->disabled()
                            ->dehydrated(false),
                        Forms\Components\DateTimePicker::make('shipment_confirmed_at')
                            ->disabled()
                            ->dehydrated(false),
                    ])
                    ->columns(2)
                    ->visible(fn (?Order $record) => $record?->shippop_purchase_id !== null)
                    ->collapsible(),

                Forms\Components\Textarea::make('notes')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('guest_name')
                    ->label('Customer')
                    ->description(fn (Order $record) => $record->guest_email)
                    ->searchable(['guest_name', 'guest_email']),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (OrderStatus $state) => $state->color())
                    ->formatStateUsing(fn (OrderStatus $state) => $state->label()),
                Tables\Columns\TextColumn::make('total')
                    ->money('THB')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()])),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            ItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
