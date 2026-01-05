
import { Expense, ExpenseFormData } from "@/types/business-travel";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches expenses for a specific business trip from unified expenses table
 */
export const fetchExpenses = async (tripId: string): Promise<Expense[]> => {
  try {
    // Zuerst aus der Haupt-expenses Tabelle laden (einheitliches System)
    const { data: mainExpenses, error: mainError } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_trip_id', tripId)
      .order('created_at', { ascending: false });

    if (mainError) {
      console.error('Error fetching main expenses:', mainError);
    }

    // Dann aus business_trip_expenses (für Rückwärtskompatibilität)
    const { data: tripExpenses, error: tripError } = await supabase
      .from('business_trip_expenses')
      .select('*')
      .eq('business_trip_id', tripId)
      .order('created_at', { ascending: false });

    if (tripError) {
      console.error('Error fetching trip expenses:', tripError);
    }

    // Kombiniere und transformiere zu einheitlichem Format
    const combinedExpenses: Expense[] = [];

    // Aus Haupt-expenses Tabelle
    (mainExpenses || []).forEach(exp => {
      combinedExpenses.push({
        id: exp.id,
        business_trip_id: exp.business_trip_id,
        description: exp.description || '',
        category: exp.category || 'other',
        amount: exp.amount || 0,
        currency: exp.currency || 'EUR',
        expense_date: exp.date || new Date().toISOString(),
        notes: '',
        approved: exp.status === 'approved',
        created_at: exp.created_at || new Date().toISOString()
      });
    });

    // Aus business_trip_expenses Tabelle (falls noch nicht migriert)
    (tripExpenses || []).forEach(exp => {
      // Prüfe ob bereits in combinedExpenses (anhand id)
      if (!combinedExpenses.find(e => e.id === exp.id)) {
        combinedExpenses.push(exp as Expense);
      }
    });

    return combinedExpenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

/**
 * Creates a new expense for a business trip in BOTH tables for compatibility
 */
export const createExpense = async (tripId: string, expenseData: ExpenseFormData): Promise<Expense | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    // Erstelle in der Haupt-expenses Tabelle (einheitliches System)
    const { data: mainExpense, error: mainError } = await supabase
      .from('expenses')
      .insert({
        business_trip_id: tripId,
        description: expenseData.description,
        category: expenseData.category,
        amount: expenseData.amount,
        currency: expenseData.currency,
        date: expenseData.expense_date,
        status: 'submitted',
        user_id: userData?.user?.id,
        submitted_by: userData?.user?.id
      })
      .select()
      .single();

    if (mainError) {
      console.error('Error creating main expense:', mainError);
      // Fallback zu business_trip_expenses wenn Haupt-Tabelle fehlschlägt
      const { data: tripExpense, error: tripError } = await supabase
        .from('business_trip_expenses')
        .insert({
          business_trip_id: tripId,
          description: expenseData.description,
          category: expenseData.category,
          amount: expenseData.amount,
          currency: expenseData.currency,
          expense_date: expenseData.expense_date,
          notes: expenseData.notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (tripError) {
        console.error('Error creating trip expense:', tripError);
        return null;
      }

      return tripExpense as Expense;
    }

    // Transformiere zu Expense-Format
    return {
      id: mainExpense.id,
      business_trip_id: tripId,
      description: mainExpense.description || '',
      category: mainExpense.category || 'other',
      amount: mainExpense.amount || 0,
      currency: mainExpense.currency || 'EUR',
      expense_date: mainExpense.date || new Date().toISOString(),
      notes: expenseData.notes,
      approved: mainExpense.status === 'approved',
      created_at: mainExpense.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    return null;
  }
};

/**
 * Deletes an expense from both tables
 */
export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  try {
    // Lösche aus Haupt-expenses Tabelle
    const { error: mainError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    // Lösche auch aus business_trip_expenses (für Rückwärtskompatibilität)
    const { error: tripError } = await supabase
      .from('business_trip_expenses')
      .delete()
      .eq('id', expenseId);

    if (mainError && tripError) {
      console.error('Error deleting expense from both tables:', mainError, tripError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};
