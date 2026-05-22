export const FOXPOST_FIXED_SHIPPING_METHOD_ID = "foxpost_fixed";
export const FOXPOST_APT_FINDER_ORIGIN = "https://cdn.foxpost.hu";
export const FOXPOST_APT_FINDER_URL = `${FOXPOST_APT_FINDER_ORIGIN}/apt-finder/v1/app/?lang=hu`;

/** Raw APT selection payload from Foxpost iframe postMessage. */
export type FoxpostApmSelection = {
  place_id?: number | string;
  operator_id?: string;
  name?: string;
  address?: string;
  zip?: string;
  city?: string;
  street?: string;
  findme?: string;
  geolat?: number;
  geolng?: number;
  country?: string;
  load?: string;
  service?: string;
  serviceString?: string;
};

export type FoxpostParcelPoint = {
  id: string;
  name: string;
  address?: string;
  zip?: string;
  city?: string;
  findme?: string;
  load?: string;
  countryCode?: string;
};
