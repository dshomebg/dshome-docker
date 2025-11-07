// Courier services constants

export interface CourierService {
  id: string;
  name: string;
  trackingUrlTemplate: string;
}

export const COURIER_SERVICES: Record<string, CourierService> = {
  SPEEDY: {
    id: 'speedy',
    name: 'Speedy',
    trackingUrlTemplate: 'https://www.speedy.bg/bg/track-shipment?barcode={trackingNumber}'
  },
  ECONT: {
    id: 'econt',
    name: 'Econt',
    trackingUrlTemplate: 'https://www.econt.com/services/track-shipment?shipmentNumber={trackingNumber}'
  },
  DHL: {
    id: 'dhl',
    name: 'DHL',
    trackingUrlTemplate: 'https://www.dhl.com/bg-en/home/tracking.html?tracking-id={trackingNumber}'
  }
};

export function generateTrackingUrl(courierId: string, trackingNumber: string): string {
  const courier = COURIER_SERVICES[courierId.toUpperCase()];
  if (!courier) {
    return '';
  }
  return courier.trackingUrlTemplate.replace('{trackingNumber}', trackingNumber);
}
