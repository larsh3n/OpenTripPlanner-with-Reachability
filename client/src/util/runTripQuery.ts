// client/src/util/runTripQuery.ts
import { request } from 'graphql-request';
import { getApiUrl } from './getApiUrl';

export async function runTripQuery(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
): Promise<number | null> {
  const query = `
  query Trip($from: Location!, $to: Location!) {
    trip(
      from: $from
      to: $to
      modes: {
        accessMode: foot
        egressMode: foot
        directMode: foot
        transportModes: [
          { transportMode: bus }
          { transportMode: tram }
          { transportMode: rail }
          { transportMode: cableway }
          { transportMode: metro }
          { transportMode: monorail }
        ]
      }
    ) {
      tripPatterns {
        legs {
          duration
          mode
        }
      }
    }
  }
`;

  const variables = {
    from: { coordinates: { latitude: from.lat, longitude: from.lon } },
    to: { coordinates: { latitude: to.lat, longitude: to.lon } },
  };

  try {
    const data = (await request(getApiUrl(), query, variables)) as any;
    const tripPatterns = data.trip?.tripPatterns;

    tripPatterns.forEach((tp: any, i: number) => {
      console.log(`TripPattern ${i}`);

      tp.legs.forEach((l: any) => {
        console.log("  mode:", l.mode, "duration:", l.duration);
      });
    });

    if (!tripPatterns || tripPatterns.length === 0) {
      console.log('No tripPatterns returned');
      return null;
    }

    console.log(`TripPatterns returned: ${tripPatterns.length}`);

    // Dauer aller TripPatterns summieren
    const durations = tripPatterns.map((tp: any, index: number) => {
      console.log(`TripPattern ${index} has ${tp.legs.length} legs`);
      return tp.legs.reduce((sum: number, l: any) => sum + l.duration, 0);
    });

    console.log('Durations of all tripPatterns:', durations);

    // Minimalen Wert nehmen
    return Math.min(...durations);
  } catch (e) {
    console.warn('Routing failed for sample point', e);
    return null;
  }
}
