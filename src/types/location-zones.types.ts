
export interface LocationZone {
  id: string;
  name: string;
  type: 'office' | 'home' | 'client' | 'mobile';
  coordinates?: {
    latitude: number;
    longitude: number;
    radius: number; // in Metern
  };
  wifi_networks?: string[];
  address?: string;
  is_active: boolean;
  auto_start_tracking?: boolean;
  auto_stop_tracking?: boolean;
  default_project?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationDetection {
  zone?: LocationZone;
  distance?: number;
  wifi_network?: string;
  gps_accuracy?: number;
  detection_method: 'gps' | 'wifi' | 'manual';
  confidence: number; // 0-100
}

export interface ZoneEvent {
  id: string;
  zone_id: string;
  event_type: 'enter' | 'exit';
  timestamp: string;
  detection_method: 'gps' | 'wifi' | 'manual';
  auto_action_taken?: 'start_tracking' | 'stop_tracking' | 'none';
}
