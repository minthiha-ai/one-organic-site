<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Filament\Resources\OrderResource;
use App\Models\Payment;
use App\Services\PaymentStatusUpdater;
use App\Services\ShippingBookingService;
use App\Services\XenditClient;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use RuntimeException;
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

            Actions\Action::make('refundViaXendit')
                ->label('Refund via Xendit')
                ->icon('heroicon-o-arrow-uturn-left')
                ->color('danger')
                ->visible(fn () => $this->record->status !== OrderStatus::Refunded && $this->refundablePayment()?->method === PaymentMethod::Card)
                ->requiresConfirmation()
                ->modalDescription('Sends the refund to Xendit for real. Only use this for damaged/incorrect items per the Refund Policy — see the order before confirming.')
                ->form([
                    Forms\Components\TextInput::make('amount')
                        ->numeric()
                        ->prefix('THB')
                        ->required()
                        ->default(fn () => (float) $this->record->total)
                        ->helperText('Defaults to the full order total — edit for a partial refund.'),
                    Forms\Components\Checkbox::make('restore_stock')
                        ->label('Restore stock')
                        ->helperText('Only if the returned item is actually sellable again — not for a genuinely damaged item.'),
                ])
                ->action(function (array $data) {
                    $payment = $this->refundablePayment();

                    try {
                        if (! $payment) {
                            throw new RuntimeException('No successful card payment found to refund.');
                        }

                        $paymentRequestId = $payment->paymentRequestId();

                        if (! $paymentRequestId) {
                            throw new RuntimeException("Could not find Xendit's payment_request_id for this payment — check its raw response.");
                        }

                        $response = (new XenditClient)->refundPayment(
                            referenceId: "refund-{$payment->id}",
                            paymentRequestId: $paymentRequestId,
                            amount: (float) $data['amount'],
                        );

                        if (($response['status'] ?? null) === 'SUCCEEDED') {
                            (new PaymentStatusUpdater)->markRefunded($this->record, $payment, (float) $data['amount'], (bool) $data['restore_stock'], $response);
                            Notification::make()->title('Refunded via Xendit')->success()->send();
                        } else {
                            Notification::make()
                                ->title('Refund requested — awaiting confirmation')
                                ->body("Xendit reports status \"{$response['status']}\" — this'll complete automatically once their webhook confirms it.")
                                ->warning()
                                ->send();
                        }
                    } catch (Throwable $e) {
                        Notification::make()->title('Refund failed')->body($e->getMessage())->danger()->send();
                    }
                    $this->record->refresh();
                    $this->fillForm();
                }),

            Actions\Action::make('markRefundedManually')
                ->label('Mark as refunded (manual)')
                ->icon('heroicon-o-banknotes')
                ->color('danger')
                ->visible(fn () => $this->record->status !== OrderStatus::Refunded && $this->refundablePayment()?->method !== PaymentMethod::Card)
                ->requiresConfirmation()
                ->modalDescription("For PromptPay and Cash on Delivery orders — Xendit can't refund these automatically. Only click this after the bank transfer has actually been sent, per the Refund Policy.")
                ->form([
                    Forms\Components\TextInput::make('amount')
                        ->numeric()
                        ->prefix('THB')
                        ->required()
                        ->default(fn () => (float) $this->record->total)
                        ->helperText('The amount actually transferred to the customer.'),
                    Forms\Components\Checkbox::make('restore_stock')
                        ->label('Restore stock')
                        ->helperText('Only if the returned item is actually sellable again — not for a genuinely damaged item.'),
                ])
                ->action(function (array $data) {
                    try {
                        (new PaymentStatusUpdater)->markRefunded($this->record, $this->refundablePayment(), (float) $data['amount'], (bool) $data['restore_stock']);
                        Notification::make()->title('Order marked as refunded')->success()->send();
                    } catch (Throwable $e) {
                        Notification::make()->title('Failed to record the refund')->body($e->getMessage())->danger()->send();
                    }
                    $this->record->refresh();
                    $this->fillForm();
                }),

            Actions\DeleteAction::make(),
        ];
    }

    protected function refundablePayment(): ?Payment
    {
        return $this->record->successfulPayment();
    }
}
