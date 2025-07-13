export type UserProfile = {
  name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: "Male" | "Female" | null;
};
export type Address = {
  id: number;
  label: string;
  recipient_name: string;
  phone_number: string;
  province_id: number;
  province_name: string;
  city_id: number;
  city_name: string;
  district_id: number;
  district_name: string;
  subdistrict_id: number;
  subdistrict_name: string;
  address_detail: string;
  postal_code?: string;
  is_primary: boolean;
};
// export type OrderSummary = {
//   id: number;
//   order_number: string;
//   status: string;
//   grand_total: number;
//   created_at: string;
// };
export type OrderSummary = {
  id: number;
  order_number: string;
  grand_total: number;
  order_status: 'pending_payment' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'failed';
  created_at: string;
};

// Tipe data untuk informasi pagination dari Laravel
export type PaginationInfo = {
  current_page: number;
  last_page: number;
  total: number;
};
export type RajaOngkirItem = { id: string; name: string };
