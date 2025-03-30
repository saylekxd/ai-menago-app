export interface Business {
  id: string;
  name: string;
  address?: string;
  industry: string;
  created_at: string;
  [key: string]: any;
}

export interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  [key: string]: any;
} 