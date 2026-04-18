export interface UserProfile {
  id: string;
  phone?: string;
  name: string;
  age?: number;
  gender?: string;
  location?: string;
  genotype?: string;
  role: 'patient' | 'worker';
  emergency_contact?: string;
}
