-- Add start_date column to utility_meters for landlord billing period calculation
ALTER TABLE public.utility_meters 
ADD COLUMN start_date date;