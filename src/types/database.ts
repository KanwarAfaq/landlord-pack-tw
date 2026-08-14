export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'waived';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  bank_code: string | null;
  bank_account_number: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  city: string;
  district: string;
  address_line: string;
  default_electricity_rate: number;
  created_at: string;
}

export interface Tenant {
  id: string;
  landlord_id: string;
  full_name: string;
  phone: string;
  national_id_or_arc: string | null;
  line_user_id: string | null;
  created_at: string;
}

export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  due_day: number;
  is_active: boolean;
  contract_pdf_url: string | null;
  created_at: string;
}

export interface RentPayment {
  id: string;
  lease_id: string;
  landlord_id: string;
  billing_month: string;
  rent_amount: number;
  utility_amount: number;
  total_amount: number;
  status: PaymentStatus;
  due_date: string;
  paid_at: string | null;
  receipt_image_url: string | null;
  created_at: string;
}