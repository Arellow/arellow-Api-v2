export interface AgentDetailDto {
  agent: {
    name: string;
    accountCreatedOn: string;
    phone_number: string;
    email: string;
    kyc_status: string | null;  // Updated to allow null
    lastLogin: string;
    kycInformation: {
      status: string;
      nin: {
        status: string | null;  // Updated to allow null
        number: string | null;  // Updated to allow null
        slip_url: string;
      };
      cac: {
        status: string;
        number: string  | null;  // Updated to allow null
        doc_url: string;
      };
      face: {
        status: string;
        image_url: string;
      };
      verified_at: Date | null;
    };
  };
 
}

export interface ProjectDto {
  outside_view_images: string[];
  price: number;
  title: string;
  property_location: string;
  region: string;
  city: string;
  neighborhood: string;
  number_of_bathrooms: number;
  number_of_bedrooms: number;
  square: number;
}