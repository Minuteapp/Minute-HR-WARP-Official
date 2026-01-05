import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: any
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              address_components?: Array<{
                types: string[];
                long_name: string;
                short_name: string;
              }>;
              formatted_address?: string;
            };
          };
        };
      };
    };
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Adresse eingeben",
  disabled,
  className
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps?.places) {
          setIsLoaded(true);
          return;
        }

        // Load Google Maps JavaScript API dynamically
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBmNjz3FV4Gtd8G2hy6U7j3xPn8chVUJhU'}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        (window as any).initMap = () => {
          setIsLoaded(true);
        };

        document.head.appendChild(script);

        return () => {
          document.head.removeChild(script);
        };
      } catch (error) {
        console.warn('Google Maps API could not be loaded:', error);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      try {
        autocompleteRef.current = new window.google!.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: ['de', 'at', 'ch'] }
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (place.address_components && onAddressSelect) {
            let street = '';
            let city = '';
            let postalCode = '';
            let country = '';

            for (const component of place.address_components) {
              const types = component.types;
              
              if (types.includes('street_number')) {
                street = component.long_name + ' ';
              }
              if (types.includes('route')) {
                street += component.long_name;
              }
              if (types.includes('locality')) {
                city = component.long_name;
              }
              if (types.includes('postal_code')) {
                postalCode = component.long_name;
              }
              if (types.includes('country')) {
                country = component.long_name;
              }
            }

            onAddressSelect({
              street: street.trim(),
              city,
              postalCode,
              country
            });
          }

          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
        });
      } catch (error) {
        console.warn('Could not initialize Google Places Autocomplete:', error);
      }
    }
  }, [isLoaded, onChange, onAddressSelect]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}