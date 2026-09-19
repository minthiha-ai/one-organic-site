<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Services\ShippingBookingService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Throwable;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('prepareShipment')
                ->label('Prepare shipment')
                ->icon('heroicon-o-cube')
                ->color('gray')
                ->visible(fn () => $this->record->shippop_purchase_id === null)
                ->action(function () {
                    try {
                        (new ShippingBookingService)->prepare($this->record);
                        Notification::make()->title('Shipment booked — review, then confirm to send it to the courier')->success()->send();
                    } catch (Throwable $e) {
                        Notification::make()->title('Booking failed')->body($e->getMessage())->danger()->send();
                    }
                    $this->record->refresh();
                    $this->fillForm();
                }),

            Actions\Action::make('confirmShipment')
                ->label('Confirm shipment')
                ->icon('heroicon-o-check-circle')
                ->color('primary')
                ->visible(fn () => $this->record->shippop_purchase_id !== null && $this->record->shipment_confirmed_at === null)
                ->requiresConfirmation()
                ->modalDescription('This sends the shipment to the courier for real. It cannot be edited or cancelled afterward.')
                ->action(function () {
                    try {
                        (new ShippingBookingService)->confirm($this->record);
                        Notification::make()->title('Shipment confirmed and sent to the courier')->success()->send();
                    } catch (Throwable $e) {
                        Notification::make()->title('Confirm failed')->body($e->getMessage())->danger()->send();
                    }
                    $this->record->refresh();
                    $this->fillForm();
                }),

            Actions\Action::make('cancelShipment')
                ->label('Cancel shipment')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn () => $this->record->shippop_purchase_id !== null && $this->record->shipment_confirmed_at === null)
                ->requiresConfirmation()
                ->action(function () {
                    try {
                        (new ShippingBookingService)->cancel($this->record);
                        Notification::make()->title('Shipment booking cancelled')->success()->send();
                    } catch (Throwable $e) {
                        Notification::make()->title('Cancel failed')->body($e->getMessage())->danger()->send();
                    }
                    $this->record->refresh();
                    $this->fillForm();
                }),

            Actions\Action::make('viewLabel')
                ->label('View label')
                ->icon('heroicon-o-printer')
                ->color('gray')
                ->visible(fn () => $this->record->label_url !== null)
                ->url(fn () => $this->record->label_url)
                ->openUrlInNewTab(),

            Actions\DeleteAction::make(),
        ];
    }
}
