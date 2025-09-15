import axios from "axios";

export const getPropertyLocation = async({address }:{address: string}) => {
    const geoResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
 params: {
   address,
   key: process.env.GOOGLE_MAPS_API_KEY,
 },
});

return  geoResponse.data;
}

export const getPropertyLocationAlternative = async({city }:{city: string}) => {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: city,
        format: 'json',
        limit: 1,
      },
    //   headers: {
    //     'User-Agent': 'arellow/1.0 (info@arellow.com)',
    //   },
    });

return  response.data;
}

 
       