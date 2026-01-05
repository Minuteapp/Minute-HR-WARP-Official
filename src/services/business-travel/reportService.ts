
import { BusinessTripReport, ReportFormData } from "@/types/business-travel";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the business trip report for a specific trip
 */
export const fetchBusinessTripReport = async (tripId: string): Promise<BusinessTripReport | null> => {
  try {
    // In a real application, this would be a call to your API or database
    // For now, we'll simulate a delay and return mock data
    const { data, error } = await supabase
      .from('business_trip_reports')
      .select('*')
      .eq('business_trip_id', tripId)
      .single();

    if (error) {
      console.error('Error fetching business trip report:', error);
      return null;
    }

    return data as BusinessTripReport;
  } catch (error) {
    console.error('Error fetching business trip report:', error);
    return null;
  }
};

/**
 * Saves or updates a business trip report
 */
export const saveBusinessTripReport = async (tripId: string, reportData: ReportFormData): Promise<BusinessTripReport | null> => {
  try {
    // Get the current timestamp
    const now = new Date().toISOString();
    
    // Check if a report already exists for this trip
    const { data: existingReport } = await supabase
      .from('business_trip_reports')
      .select('id')
      .eq('business_trip_id', tripId)
      .single();
    
    let result;
    
    if (existingReport) {
      // Update the existing report
      const { data, error } = await supabase
        .from('business_trip_reports')
        .update({
          content: reportData.content,
          success_rating: reportData.success_rating,
          feedback: reportData.feedback,
          updated_at: now
        })
        .eq('id', existingReport.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create a new report
      const { data, error } = await supabase
        .from('business_trip_reports')
        .insert({
          business_trip_id: tripId,
          content: reportData.content,
          success_rating: reportData.success_rating,
          feedback: reportData.feedback,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    // Update the business trip to record that the report was submitted
    await supabase
      .from('business_trips')
      .update({
        report_submitted_at: now
      })
      .eq('id', tripId);
    
    return result as BusinessTripReport;
  } catch (error) {
    console.error('Error saving business trip report:', error);
    return null;
  }
};
