-- Update mapbox_settings with user's actual token
-- User needs to replace 'YOUR_ACTUAL_MAPBOX_TOKEN_HERE' with their real Mapbox public token

UPDATE public.mapbox_settings 
SET public_token = 'YOUR_ACTUAL_MAPBOX_TOKEN_HERE'
WHERE public_token = 'pk.your_mapbox_public_token_here';