import { FakeGeocodingService } from '../FakeGeocodingService';

describe('FakeGeocodingService', () => {
  const service = new FakeGeocodingService();

  it('should return coordinates for a known address', async () => {
    const address = "10 Rue de la Paix, Paris";
    const coords = await service.geocode(address);

    expect(coords).not.toBeNull();
    expect(coords?.latitude).toBeDefined();
    expect(coords?.longitude).toBeDefined();
  });

  it('should return null for an unknown address', async () => {
    const coords = await service.geocode("Adresse Inconnue");
    expect(coords).toBeNull();
  });
});
