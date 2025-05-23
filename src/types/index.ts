// Update the Lab interface
export interface Lab {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  doctorId: string;
  testType: string;
  date: string;
  results?: string;
  referenceRange?: {
    min: number;
    max: number;
    unit: string;
  };
  isAbnormal?: boolean;
  status: 'pending' | 'completed' | 'cancelled';
  reportUrl?: string;
  requestedBy: string;
  performedAt?: string;
  createdAt: string;
  updatedAt: string;
}