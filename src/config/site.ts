// Store settings — edit these before going live.
export const site = {
  name: "Arganista",
  // WhatsApp number that receives orders, international format without "+" (placeholder).
  whatsapp: "212600000000",
  email: "contact@arganista.ma",
  instagram: "https://www.instagram.com/arganistacosmetics/",
  facebook: "https://facebook.com/",
  // Boutique (Google Maps: "Arganista Cosmetics Ourika")
  address: "Village Aghbalou, Setti Fadma, Ourika — Marrakech 42450",
  boutique: {
    name: "Dar Arganista", // traditional name shown on the site
    nameAr: "دار أركانيستا",
    mapsName: "Arganista Cosmetics Ourika", // name on Google Maps
    lat: 31.3061463,
    lng: -7.7335015,
    mapsUrl: "https://maps.app.goo.gl/c92YW1hQeqmrP4Mp8",
    // from the Google Maps listing
    phone: "0719308144",
    phoneDisplay: "07 19 30 81 44",
    opens: "08:00",
    closes: "18:00",
    googleRating: 5.0,
    googleReviews: 6,
    photos: ["facade", "interieur", "etageres", "alveoles", "bocaux", "presentoir"].map((n) => `/images/boutique/${n}.jpg`),
  },
  currency: "DH",
  shippingFee: 35,
  freeShippingFrom: 300,
};

export const cities = [
  "Casablanca", "Rabat", "Marrakech", "Agadir", "Tanger", "Fès", "Meknès", "Oujda",
  "Kénitra", "Tétouan", "Salé", "Témara", "Mohammedia", "El Jadida", "Essaouira",
  "Taroudant", "Tiznit", "Ouarzazate", "Laâyoune", "Dakhla", "Béni Mellal", "Nador",
];
