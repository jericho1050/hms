-- Ensure the uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------- VIEWS ----------------------------
create view public.appointment_dashboard_view as 
SELECT a.id,
    a.created_at,
    a.updated_at,
    a.patient_id AS patientid,
    (p.first_name || ' '::text) || p.last_name AS patientname,
    a.staff_id AS doctorid,
    (s.first_name || ' '::text) || s.last_name AS doctorname,
    d.name AS department,
    a.appointment_date::text AS date,
    a.start_time::text AS starttime,
    a.end_time::text AS endtime,
    a.status,
    a.appointment_type AS type,
    a.notes,
    a.room_number,
    EXTRACT(dow FROM a.appointment_date) AS dayofweek,
    EXTRACT(week FROM a.appointment_date) AS weeknumber,
    EXTRACT(month FROM a.appointment_date) AS month,
    EXTRACT(year FROM a.appointment_date) AS year,
    a.appointment_date = CURRENT_DATE AS istoday,
        CASE a.status
            WHEN 'completed'::text THEN true
            ELSE false
        END AS iscompleted,
        CASE a.status
            WHEN 'no-show'::text THEN true
            ELSE false
        END AS isnoshow,
        CASE a.status
            WHEN 'scheduled'::text THEN true
            ELSE false
        END AS ispending
FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN staff s ON a.staff_id = s.id
    LEFT JOIN departments d ON s.department = d.name;

create view public.appointment_stats as 
SELECT count(*) FILTER (WHERE appointment_dashboard_view.istoday) AS totaltoday,
    count(*) FILTER (WHERE appointment_dashboard_view.istoday AND appointment_dashboard_view.iscompleted) AS completed,
    count(*) FILTER (WHERE appointment_dashboard_view.istoday AND appointment_dashboard_view.isnoshow) AS noshows,
    count(*) FILTER (WHERE appointment_dashboard_view.istoday AND appointment_dashboard_view.ispending) AS pending
FROM appointment_dashboard_view;

create view public.dashboard_metrics as 
SELECT ( SELECT count(*) AS count
        FROM patients) AS total_patients,
    ( SELECT count(*) AS count
        FROM staff) AS total_staff,
    ( SELECT count(*) AS count
        FROM appointments
       WHERE appointments.appointment_date = CURRENT_DATE) AS today_appointments,
    ( SELECT sum(billing.total_amount) AS sum
        FROM billing
       WHERE EXTRACT(month FROM billing.invoice_date) = EXTRACT(month FROM CURRENT_DATE)) AS monthly_revenue,
    (( SELECT avg(rooms.current_occupancy::double precision / rooms.capacity::double precision) AS avg
        FROM rooms)) * 100::double precision AS bed_occupancy_rate,
    ( SELECT count(*) AS count
        FROM inventory) AS total_inventory_items;
--------------------------------------------------------------------------------

---------------- TABLES ------------------------
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  patient_id uuid NOT NULL,
  staff_id uuid NOT NULL,
  appointment_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  status text NOT NULL,
  appointment_type text NOT NULL,
  reason text NULL,
  notes text NULL,
  room_number text NULL,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staff(id),
  CONSTRAINT appointment_time_check CHECK ((start_time < end_time))
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments USING btree (appointment_date) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments USING btree (patient_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments USING btree (staff_id) TABLESPACE pg_default;

CREATE TABLE public.billing (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  patient_id uuid NOT NULL,
  invoice_date date NOT NULL,
  due_date date NULL,
  total_amount numeric NOT NULL,
  payment_status text NOT NULL,
  payment_method text NULL,
  payment_date date NULL,
  services jsonb NOT NULL,
  insurance_claim_id text NULL,
  insurance_coverage numeric NULL,
  discount numeric NULL,
  tax numeric NULL,
  notes text NULL,
  CONSTRAINT billing_pkey PRIMARY KEY (id),
  CONSTRAINT billing_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id)
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_billing_patient ON public.billing USING btree (patient_id) TABLESPACE pg_default;

CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text NULL,
  head_staff_id uuid NULL,
  location text NULL,
  total_capacity integer NULL,
  current_utilization integer NULL,
  color text,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_head_staff_id_fkey FOREIGN KEY (head_staff_id) REFERENCES staff(id)
) TABLESPACE pg_default;

CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  item_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL,
  unit text NULL,
  cost_per_unit numeric NULL,
  supplier text NULL,
  reorder_level integer NULL,
  location text NULL,
  expiry_date date NULL,
  status text NOT NULL,
  sku text,
  description text,
  last_restocked timestamp with time zone,
  CONSTRAINT inventory_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON public.inventory USING btree (quantity)  TABLESPACE pg_default WHERE (quantity <= reorder_level);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);

CREATE TABLE public.medical_records (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  patient_id uuid NOT NULL,
  staff_id uuid NOT NULL,
  record_date date NOT NULL,
  diagnosis text NOT NULL,
  treatment text NOT NULL,
  prescription jsonb NULL,
  follow_up_date date NULL,
  notes text NULL,
  attachments text[] NULL,
  vital_signs jsonb NULL,
  outcome text NULL,
  readmission boolean DEFAULT false,
  CONSTRAINT medical_records_pkey PRIMARY KEY (id),
  CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT medical_records_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staff(id)
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records USING btree (patient_id) TABLESPACE pg_default;

CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  insurance_provider text NULL,
  insurance_id text NULL,
  emergency_contact_name text NULL,
  emergency_contact_phone text NULL,
  medical_history jsonb NULL,
  allergies text[] NULL,
  blood_type text NULL,
  marital_status text NULL,
  city text NULL,
  state text NULL,
  zip_code text NULL,
  emergency_contact_relationship text NULL,
  insurance_group_number text NULL,
  current_medications text NULL,
  past_surgeries text NULL,
  chronic_conditions text NULL,
  policy_holder_name text NULL,
  relationship_to_patient text NULL,
  emergency_contact_address text NULL,
  status text NOT NULL DEFAULT 'Admitted',
  CONSTRAINT check_patient_status CHECK (status IN ('Admitted', 'Discharged', 'Outpatient')),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT check_relationship_to_patient CHECK (((relationship_to_patient IS NULL) OR (relationship_to_patient = ANY (ARRAY['self'::text, 'spouse'::text, 'parent'::text, 'other'::text]))))
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients USING btree (last_name, first_name) TABLESPACE pg_default;

CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  room_number text NOT NULL,
  department_id uuid NULL,
  room_type text NOT NULL,
  capacity integer NOT NULL,
  current_occupancy integer NOT NULL DEFAULT 0,
  status text NOT NULL,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT occupancy_check CHECK ((current_occupancy <= capacity)),
  floor text NULL,
  wing text NULL,
  amenities text[] NULL,
  features jsonb NULL,
  last_cleaned timestamp with time zone NULL,
  cleaning_status text DEFAULT 'clean',
  is_isolation boolean DEFAULT false
) TABLESPACE pg_default;

-- New table for patient-room assignments
CREATE TABLE public.patient_room_assignments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  patient_id uuid NOT NULL,
  room_id uuid NOT NULL,
  bed_number integer NOT NULL,
  admission_date timestamp with time zone NOT NULL DEFAULT now(),
  discharge_date timestamp with time zone NULL,
  assigned_by uuid NOT NULL, -- staff_id who made the assignment
  status text NOT NULL DEFAULT 'occupied', -- 'occupied', 'discharged', etc.
  notes text NULL,
  CONSTRAINT patient_room_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT patient_room_assignments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT patient_room_assignments_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id),
  CONSTRAINT patient_room_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES staff(id)
) TABLESPACE pg_default;
CREATE INDEX idx_patient_room_current ON public.patient_room_assignments USING btree (room_id, discharge_date) TABLESPACE pg_default;

-- View for room occupancy history
CREATE VIEW public.room_occupancy_history AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.department_id,
  d.name as department_name,
  date_trunc('day', pra.admission_date) as date,
  COUNT(DISTINCT pra.patient_id) as patients_admitted,
  SUM(CASE WHEN pra.discharge_date IS NULL THEN 1 ELSE 0 END) as current_patients,
  r.capacity,
  ROUND((SUM(CASE WHEN pra.discharge_date IS NULL THEN 1 ELSE 0 END)::decimal / r.capacity) * 100, 2) as occupancy_rate
FROM rooms r
LEFT JOIN departments d ON r.department_id = d.id
LEFT JOIN patient_room_assignments pra ON r.id = pra.room_id
GROUP BY r.id, r.room_number, r.department_id, d.name, date_trunc('day', pra.admission_date), r.capacity
ORDER BY date_trunc('day', pra.admission_date) DESC, r.room_number;

CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  specialty text NULL,
  qualification text NULL,
  joining_date date NOT NULL,
  contact_number text NOT NULL,
  email text NOT NULL,
  address text NULL,
  status text NOT NULL,
  license_number text NULL,
  availability JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT staff_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_staff_department ON public.staff USING btree (department) TABLESPACE pg_default;

CREATE TABLE public.report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  file_format TEXT,
  recipients TEXT NOT NULL,
  filters JSONB NOT NULL,
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster querying of reports due to be sent
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run);

CREATE TABLE financial_historical_metrics (
  id SERIAL PRIMARY KEY,
  period VARCHAR(20) NOT NULL, -- e.g., "2023-01", "2023-Q1"
  metric_name VARCHAR(50) NOT NULL, -- e.g., "revenue", "outstanding_bills"
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries on financial historical metrics
CREATE INDEX idx_financial_metrics_period_name ON financial_historical_metrics(period, metric_name);

--------------------------------------------------------------------------------------------------------------

---------------- Functions ------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_appointment_availability(
    p_staff_id uuid,
    p_date date,
    p_start_time time without time zone,
    p_end_time time without time zone
)
RETURNS boolean AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT COUNT(*) = 0 INTO is_available
    FROM appointments
    WHERE 
        staff_id = p_staff_id AND
        appointment_date = p_date AND
        (
            (start_time <= p_start_time AND end_time > p_start_time) OR
            (start_time < p_end_time AND end_time >= p_end_time) OR
            (start_time >= p_start_time AND end_time <= p_end_time)
        );
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if user should be added as staff (could check for a role or flag)
    -- For example: IF NEW.raw_user_meta_data->>'is_staff' = 'true' THEN
    
    -- Handle potential NULL metadata values
    INSERT INTO public.staff (
        user_id, 
        first_name, 
        last_name, 
        role, 
        department,
        joining_date, 
        contact_number, 
        email, 
        status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),  -- Default if null
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),  -- Default if null
        'New Staff',
        'Unassigned',
        CURRENT_DATE,
        COALESCE(NEW.raw_user_meta_data->>'phone', 'Not provided'), -- Better default
        NEW.email,
        'Pending'  -- Start as pending until admin reviews
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_user_in_staff(
    user_id_param uuid
)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM staff WHERE user_id = user_id_param);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_user_in_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM staff WHERE staff.role = 'admin'::text);
END;
$$ LANGUAGE plpgsql;

-- Function to check if a room has available beds
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_id uuid
)
RETURNS boolean AS $$
DECLARE
  occupancy integer;
  capacity integer;
BEGIN
  SELECT r.current_occupancy, r.capacity INTO occupancy, capacity
  FROM rooms r
  WHERE r.id = p_room_id;
  
  RETURN occupancy < capacity;
END;
$$ LANGUAGE plpgsql;

-- Function to assign patient to room
CREATE OR REPLACE FUNCTION public.assign_patient_to_room(
  p_patient_id uuid,
  p_room_id uuid,
  p_bed_number integer,
  p_staff_id uuid
)
RETURNS uuid AS $$
DECLARE
  new_assignment_id uuid;
BEGIN
  -- Check if room has capacity
  IF NOT public.check_room_availability(p_room_id) THEN
    RAISE EXCEPTION 'Room is at full capacity';
  END IF;
  
  -- Insert assignment
  INSERT INTO patient_room_assignments(
    patient_id, 
    room_id, 
    bed_number, 
    assigned_by, 
    status
  ) VALUES (
    p_patient_id,
    p_room_id,
    p_bed_number,
    p_staff_id,
    'occupied'
  ) RETURNING id INTO new_assignment_id;
  
  -- Update room occupancy
  UPDATE rooms 
  SET current_occupancy = current_occupancy + 1
  WHERE id = p_room_id;
  
  RETURN new_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to discharge patient from room
CREATE OR REPLACE FUNCTION public.discharge_patient_from_room(
  p_assignment_id uuid
)
RETURNS boolean AS $$
DECLARE
  room_id_var uuid;
BEGIN
  -- Get room id
  SELECT room_id INTO room_id_var
  FROM patient_room_assignments
  WHERE id = p_assignment_id AND discharge_date IS NULL;
  
  IF room_id_var IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update assignment
  UPDATE patient_room_assignments
  SET 
    discharge_date = now(),
    status = 'discharged',
    updated_at = now()
  WHERE id = p_assignment_id;
  
  -- Update room occupancy
  UPDATE rooms 
  SET current_occupancy = GREATEST(0, current_occupancy - 1)
  WHERE id = room_id_var;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update room status when occupancy changes
CREATE OR REPLACE FUNCTION update_room_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.current_occupancy = 0 THEN
    NEW.status = 'available';
  ELSIF NEW.current_occupancy = NEW.capacity THEN
    NEW.status = 'full';
  ELSE
    NEW.status = 'partially occupied';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.recalculate_room_occupancy()
RETURNS void AS $$
BEGIN
  -- First, reset all rooms to 0 occupancy
  UPDATE rooms SET current_occupancy = 0;
  
  -- Then recalculate based on current assignments
  UPDATE rooms r
  SET current_occupancy = COALESCE(count_occupied.occupied_count, 0)
  FROM (
    SELECT room_id, COUNT(*) as occupied_count 
    FROM patient_room_assignments 
    WHERE discharge_date IS NULL
    GROUP BY room_id
  ) count_occupied
  WHERE r.id = count_occupied.room_id;
  
  -- The trigger will automatically update the status field
END;
$$ LANGUAGE plpgsql;

-- PostgreSQL trigger to automatically update financial metrics
-- Run this script in your Supabase SQL editor

-- First, add a unique constraint to prevent duplicate period/metric combinations
ALTER TABLE financial_historical_metrics 
ADD CONSTRAINT unique_period_metric UNIQUE (period, metric_name);

-- Function to calculate and update financial metrics
CREATE OR REPLACE FUNCTION update_financial_historical_metrics()
RETURNS TRIGGER AS $$
DECLARE
  current_period VARCHAR(20);
  total_revenue NUMERIC;
  outstanding_bills NUMERIC;
  insurance_claims INTEGER;
  collection_rate NUMERIC;
BEGIN
  -- Get current period (format: YYYY-MM)
  current_period := to_char(CURRENT_DATE, 'YYYY-MM');
  
  -- Calculate total revenue for current period
  SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue
  FROM billing
  WHERE to_char(invoice_date, 'YYYY-MM') = current_period;
  
  -- Calculate outstanding bills for current period
  SELECT COALESCE(SUM(total_amount), 0) INTO outstanding_bills
  FROM billing
  WHERE to_char(invoice_date, 'YYYY-MM') = current_period
  AND payment_status = 'pending';
  
  -- Calculate insurance claims for current period
  SELECT COUNT(*) INTO insurance_claims
  FROM billing
  WHERE to_char(invoice_date, 'YYYY-MM') = current_period
  AND insurance_claim_id IS NOT NULL;
  
  -- Calculate collection rate for current period
  SELECT 
    CASE 
      WHEN SUM(total_amount) > 0 
      THEN (SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) / SUM(total_amount)) * 100
      ELSE 0
    END INTO collection_rate
  FROM billing
  WHERE to_char(invoice_date, 'YYYY-MM') = current_period;
  
  -- Upsert metrics (insert or update if exists)
  
  -- Revenue
  INSERT INTO financial_historical_metrics (period, metric_name, metric_value)
  VALUES (current_period, 'revenue', total_revenue)
  ON CONFLICT (period, metric_name) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, recorded_at = NOW();
  
  -- Outstanding bills
  INSERT INTO financial_historical_metrics (period, metric_name, metric_value)
  VALUES (current_period, 'outstanding_bills', outstanding_bills)
  ON CONFLICT (period, metric_name) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, recorded_at = NOW();
  
  -- Insurance claims
  INSERT INTO financial_historical_metrics (period, metric_name, metric_value)
  VALUES (current_period, 'insurance_claims', insurance_claims)
  ON CONFLICT (period, metric_name) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, recorded_at = NOW();
  
  -- Collection rate
  INSERT INTO financial_historical_metrics (period, metric_name, metric_value)
  VALUES (current_period, 'collection_rate', collection_rate)
  ON CONFLICT (period, metric_name) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, recorded_at = NOW();
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update the last_restocked timestamp
CREATE OR REPLACE FUNCTION update_last_restocked()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.quantity < NEW.quantity THEN
    NEW.last_restocked = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update the status based on quantity and reorder_level
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.reorder_level THEN
    NEW.status = 'low';
  ELSE
    NEW.status = 'in-stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for expiring items
CREATE OR REPLACE FUNCTION update_expiring_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if item is expiring within 30 days
  IF NEW.expiry_date IS NOT NULL AND 
     NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND 
     NEW.expiry_date >= CURRENT_DATE THEN
    NEW.status = 'expiring-soon';
  -- Check if item is expired
  ELSIF NEW.expiry_date IS NOT NULL AND 
        NEW.expiry_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------------------------------

--------------- Triggers ------------------------

CREATE TRIGGER update_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_room_status_trigger
BEFORE UPDATE ON public.rooms
FOR EACH ROW
WHEN (OLD.current_occupancy IS DISTINCT FROM NEW.current_occupancy)
EXECUTE FUNCTION update_room_status();

-- Trigger to automatically update last_restocked when quantity increases
CREATE TRIGGER update_inventory_last_restocked
BEFORE UPDATE ON public.inventory
FOR EACH ROW
WHEN (OLD.quantity < NEW.quantity)
EXECUTE FUNCTION update_last_restocked();

-- Trigger to automatically update status based on quantity and reorder_level
CREATE TRIGGER update_inventory_status_trigger
BEFORE INSERT OR UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION update_inventory_status();

-- Trigger for updating expiring status
CREATE TRIGGER update_expiry_status_trigger
BEFORE INSERT OR UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION update_expiring_status();

-- Create triggers to run after changes to billing table
CREATE TRIGGER update_financial_metrics_after_insert
AFTER INSERT ON billing
FOR EACH STATEMENT
EXECUTE FUNCTION update_financial_historical_metrics();

CREATE TRIGGER update_financial_metrics_after_update
AFTER UPDATE ON billing
FOR EACH STATEMENT
EXECUTE FUNCTION update_financial_historical_metrics();

CREATE TRIGGER update_financial_metrics_after_delete
AFTER DELETE ON billing
FOR EACH STATEMENT
EXECUTE FUNCTION update_financial_historical_metrics();

-- Optional: Run the function once to populate current metrics
SELECT update_financial_historical_metrics(); 

-------------------------------------------------


----------------- RLS Policies ------------------

CREATE POLICY "Admin can access all data" ON public.appointments
FOR ALL
TO public
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Admin can access all data" ON public.billing
FOR ALL
TO public
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Admin can access all data" ON public.departments
FOR ALL
TO public
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Admin can access all data" ON public.inventory
FOR ALL
TO public
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Admin can access all data" ON public.medical_records
FOR ALL
TO public
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Admin can access all data" ON public.patients
FOR ALL
TO authenticated
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Admin can access all data" ON public.patient_room_assignments
FOR ALL
TO public
USING (is_user_in_staff() AND is_admin());

CREATE POLICY "Staff can read data" ON public.appointments
FOR SELECT
TO authenticated
USING (is_user_in_staff());

CREATE POLICY "Staff can read data" ON public.billing
FOR SELECT
TO authenticated
USING (is_user_in_staff());

CREATE POLICY "Staff can read data" ON public.departments
FOR SELECT
TO authenticated
USING (is_user_in_staff());

CREATE POLICY "Staff can read data" ON public.inventory
FOR SELECT
TO authenticated
USING (is_user_in_staff());

CREATE POLICY "Staff can read data" ON public.medical_records
FOR SELECT
TO authenticated
USING (is_user_in_staff());

CREATE POLICY "Staff can read data" ON public.patients
FOR SELECT
TO authenticated
USING (is_user_in_staff());

