import { getPropertyLocation, getPropertyLocationAlternative } from "../../../lib/propertyLocation";

export const locationService = {

  async resolve(neighborhood: string, city: string) {

    const DEFAULT_LOCATION = {
      lat: 9.6000359,
      lng: 7.9999721
    };

    try {

      const google = await getPropertyLocation({ address: neighborhood });

      if (google?.status === "OK" && google?.results?.length) {

        const loc = google.results[0].geometry.location;

        return {
          lat: Number(loc.lat),
          lng: Number(loc.lng)
        };

      }

      const alt = await getPropertyLocationAlternative({ city });

      if (alt?.length) {
        return {
          lat: Number(alt[0].lat),
          lng: Number(alt[0].lon)
        };
      }

    } catch {}

    return DEFAULT_LOCATION;

  }

};