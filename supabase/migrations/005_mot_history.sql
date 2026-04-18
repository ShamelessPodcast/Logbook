-- Add MOT history storage to vehicles table
-- Stores the full DVSA MOT History API response as JSONB

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS mot_history jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS co2_emissions integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS euro_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS wheelplan text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_of_last_v5c_issued text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS marked_for_export boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mot_history_updated_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.vehicles.mot_history IS 'Full DVSA MOT History API response (motTests array)';
COMMENT ON COLUMN public.vehicles.co2_emissions IS 'CO2 emissions in g/km from DVLA VES';
COMMENT ON COLUMN public.vehicles.euro_status IS 'Euro emissions standard from DVLA VES';
