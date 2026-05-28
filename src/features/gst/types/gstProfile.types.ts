export interface GSTBusinessProfile {
  id: string;
  gstin: string;
  financialYear: string;
}

export interface BusinessProfileResponse {
  businessName?: string;
  gstinNumber?: string;
  financialYear?: string;
}