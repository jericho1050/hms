-- Create beds table
CREATE TABLE public.beds (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  room_id uuid NOT NULL,
  name text NOT NULL,
  bed_number integer NOT NULL,
  type text NOT NULL DEFAULT 'Standard',
  patient_id uuid NULL,
  admission_date timestamp with time zone NULL,
  expected_discharge_date timestamp with time zone NULL,
  is_emergency boolean DEFAULT false,
  status text NOT NULL DEFAULT 'available',
  CONSTRAINT beds_pkey PRIMARY KEY (id),
  CONSTRAINT beds_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT beds_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  CONSTRAINT beds_unique_room_number UNIQUE (room_id, bed_number)
);

CREATE INDEX idx_beds_room ON public.beds USING btree (room_id) TABLESPACE pg_default;
CREATE INDEX idx_beds_patient ON public.beds USING btree (patient_id) TABLESPACE pg_default WHERE (patient_id IS NOT NULL);

-- Create room history table
CREATE TABLE public.room_history (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  room_id uuid NOT NULL,
  bed_id uuid NULL,
  patient_id uuid NULL,
  action text NOT NULL,
  action_type text NOT NULL,
  performed_by uuid NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT room_history_pkey PRIMARY KEY (id),
  CONSTRAINT room_history_room_id_fkey FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_history_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
  CONSTRAINT room_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  CONSTRAINT room_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE INDEX idx_room_history_room ON public.room_history USING btree (room_id) TABLESPACE pg_default;

-- Add trigger to populate beds for existing rooms
CREATE OR REPLACE FUNCTION public.populate_beds_for_room()
RETURNS TRIGGER AS $$
DECLARE
  i INTEGER;
BEGIN
  -- Create beds for the new room
  FOR i IN 1..NEW.capacity LOOP
    INSERT INTO public.beds (room_id, name, bed_number, type, status)
    VALUES (NEW.id, 'Bed ' || i, i, 'Standard', 'available');
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_beds_for_new_room
AFTER INSERT ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.populate_beds_for_room();

-- Populate beds for existing rooms
DO $$
DECLARE
  r RECORD;
  i INTEGER;
BEGIN
  FOR r IN SELECT id, capacity FROM public.rooms LOOP
    FOR i IN 1..r.capacity LOOP
      INSERT INTO public.beds (room_id, name, bed_number, type, status)
      VALUES (r.id, 'Bed ' || i, i, 'Standard', 'available')
      ON CONFLICT (room_id, bed_number) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$; 