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
  CONSTRAINT inventory_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON public.inventory USING btree (quantity)  TABLESPACE pg_default WHERE (quantity <= reorder_level);

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
  CONSTRAINT occupancy_check CHECK ((current_occupancy <= capacity))
) TABLESPACE pg_default;

CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
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
  CONSTRAINT staff_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_staff_department ON public.staff USING btree (department) TABLESPACE pg_default;

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

-------------------------------------------------


