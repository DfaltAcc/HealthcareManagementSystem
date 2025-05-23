/*
  # Lab Results System Integration

  1. New Tables
    - `lab_results`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `medical_record_id` (uuid, references medical_records)
      - `lab_type` (text)
      - `result_value` (jsonb)
      - `reference_range` (jsonb)
      - `is_abnormal` (boolean)
      - `status` (text)
      - `ordered_by` (uuid, references users)
      - `performed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Security
    - Enable RLS on `lab_results` table
    - Add policies for doctors and patients
    - Ensure data integrity with foreign key constraints

  3. Audit Trail
    - Track all changes to lab results
*/

-- Create lab_results table
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  medical_record_id uuid REFERENCES medical_records(id) ON DELETE SET NULL,
  lab_type text NOT NULL,
  result_value jsonb NOT NULL,
  reference_range jsonb,
  is_abnormal boolean DEFAULT false,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  ordered_by uuid REFERENCES users(id) NOT NULL,
  performed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_medical_record_id ON lab_results(medical_record_id);

-- Enable RLS
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Policies for lab results
CREATE POLICY "Doctors can view all lab results"
  ON lab_results
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'doctor'
    )
  );

CREATE POLICY "Patients can view their own lab results"
  ON lab_results
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create lab results"
  ON lab_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'doctor'
    )
  );

CREATE POLICY "Doctors can update lab results"
  ON lab_results
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'doctor'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'doctor'
    )
  );

-- Create audit trail
CREATE TABLE IF NOT EXISTS lab_results_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id uuid REFERENCES lab_results(id) ON DELETE CASCADE NOT NULL,
  changed_by uuid REFERENCES users(id) NOT NULL,
  changed_at timestamptz DEFAULT now(),
  old_value jsonb,
  new_value jsonb
);

-- Function to record audit trail
CREATE OR REPLACE FUNCTION record_lab_result_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lab_results_audit (
    lab_result_id,
    changed_by,
    old_value,
    new_value
  ) VALUES (
    NEW.id,
    auth.uid(),
    row_to_json(OLD)::jsonb,
    row_to_json(NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for audit trail
CREATE TRIGGER lab_results_audit_trigger
  AFTER UPDATE ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION record_lab_result_changes();