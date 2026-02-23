import { FakeMapService } from '../FakeMapService';

describe('FakeMapService', () => {
  const service = new FakeMapService();

  it('should calculate distance correctly between two points', () => {
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    const lyon = { latitude: 45.7640, longitude: 4.8357 };

    const distance = service.getAirDistance(paris, lyon);

    // Distance approx Paris-Lyon : ~390km
    // On vérifie que c'est dans un ordre de grandeur cohérent (mètres)
    expect(distance).toBeGreaterThan(300000);
    expect(distance).toBeLessThan(500000);
  });
});
