
import { LocationZone, ZoneEvent } from '@/types/location-zones.types';
import { supabase } from '@/integrations/supabase/client';

export const locationZoneService = {
  async getZones(): Promise<LocationZone[]> {
    console.log('Fetching location zones from database...');
    
    try {
      const { data: zones, error } = await supabase
        .from('location_zones')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching zones:', error);
        throw error;
      }

      return zones || [];
    } catch (error) {
      console.error('Error in getZones:', error);
      return [];
    }
  },

  async getZone(id: string): Promise<LocationZone | null> {
    try {
      const { data: zone, error } = await supabase
        .from('location_zones')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching zone:', error);
        return null;
      }

      return zone;
    } catch (error) {
      console.error('Error in getZone:', error);
      return null;
    }
  },

  async createZone(zone: Omit<LocationZone, 'id' | 'created_at' | 'updated_at'>): Promise<LocationZone> {
    try {
      const { data: newZone, error } = await supabase
        .from('location_zones')
        .insert([zone])
        .select()
        .single();

      if (error) {
        console.error('Error creating zone:', error);
        throw error;
      }

      console.log('Zone created:', newZone);
      return newZone;
    } catch (error) {
      console.error('Error in createZone:', error);
      throw error;
    }
  },

  async updateZone(id: string, updates: Partial<LocationZone>): Promise<LocationZone> {
    try {
      const { data: updatedZone, error } = await supabase
        .from('location_zones')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating zone:', error);
        throw error;
      }

      console.log('Zone updated:', updatedZone);
      return updatedZone;
    } catch (error) {
      console.error('Error in updateZone:', error);
      throw error;
    }
  },

  async deleteZone(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('location_zones')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error deleting zone:', error);
        throw error;
      }

      console.log('Zone deleted:', id);
    } catch (error) {
      console.error('Error in deleteZone:', error);
      throw error;
    }
  },

  async recordZoneEvent(event: Omit<ZoneEvent, 'id' | 'timestamp'>): Promise<ZoneEvent> {
    try {
      const { data: zoneEvent, error } = await supabase
        .from('zone_events')
        .insert([{
          ...event,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error recording zone event:', error);
        throw error;
      }

      console.log('Zone event recorded:', zoneEvent);
      return zoneEvent;
    } catch (error) {
      console.error('Error in recordZoneEvent:', error);
      throw error;
    }
  },

  async getRecentEvents(): Promise<ZoneEvent[]> {
    try {
      const { data: events, error } = await supabase
        .from('zone_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent events:', error);
        throw error;
      }

      return events || [];
    } catch (error) {
      console.error('Error in getRecentEvents:', error);
      return [];
    }
  }
};
