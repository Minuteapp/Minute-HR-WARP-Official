import { supabase } from "@/integrations/supabase/client";
import type { Document, DocumentCategory, DocumentStatus } from "@/types/documents";
import { emitEvent } from "@/services/eventEmitterService";

export const documentCrudService = {
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  async getDocumentsByCategory(category: DocumentCategory) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('category', category)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Document;
  },

  async getDownloadUrl(filePath: string) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60); // URL gültig für 60 Sekunden

    if (error) throw error;
    return { data, error };
  },

  async uploadDocument(file: File, data: Partial<Document>, enableAiAnalysis: boolean = false) {
    try {
      console.log('[Documents] Starting document upload...', { fileName: file.name, fileSize: file.size, enableAiAnalysis });
      
      // Verbesserte Auth-Prüfung mit Session-Fallback
      let userId: string | null = null;
      
      // Erst getSession versuchen (stabiler)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Documents] Session error:', sessionError);
      }
      
      if (sessionData?.session?.user) {
        userId = sessionData.session.user.id;
        console.log('[Documents] User from session:', userId);
      } else {
        // Fallback auf getUser
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('[Documents] User error:', userError);
          throw new Error(`Authentifizierungsfehler: ${userError.message}`);
        }
        
        if (userData?.user) {
          userId = userData.user.id;
          console.log('[Documents] User from getUser:', userId);
        }
      }
      
      if (!userId) {
        console.error('[Documents] No authenticated user found');
        throw new Error('Sie müssen angemeldet sein, um Dokumente hochzuladen');
      }

      console.log('[Documents] User authenticated:', userId);

      // Get company_id via RPC for tenant/impersonation support
      let companyId: string | null = null;
      try {
        const { data: effectiveCompanyId, error: rpcError } = await supabase.rpc('get_effective_company_id');
        if (rpcError) {
          console.warn('[Documents] RPC error, falling back to profile:', rpcError);
          // Fallback to profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', userId)
            .single();
          companyId = profile?.company_id || null;
        } else {
          companyId = effectiveCompanyId;
        }
        console.log('[Documents] Company ID:', companyId);
      } catch (profileError) {
        console.warn('[Documents] Could not fetch company_id:', profileError);
      }

      // Validate company_id is present - required for audit trail
      if (!companyId) {
        console.error('[Documents] No company_id available - required for document storage');
        throw new Error('Keine Unternehmens-ID gefunden. Bitte stellen Sie sicher, dass Sie einem Unternehmen zugeordnet sind.');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      console.log('[Documents] Uploading file to storage...', { filePath });
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[Documents] Storage upload error:', uploadError);
        throw new Error(`Fehler beim Hochladen: ${uploadError.message}`);
      }

      console.log('[Documents] File uploaded successfully to storage', uploadData);
      console.log('[Documents] Inserting document record into database...');

      // Map 'expenses' to 'company' since 'expenses' is not in the DB enum
      // Store original category in metadata for UI display
      const dbCategory = data.category === 'expenses' ? 'company' : (data.category || 'training');
      const enhancedMetadata = {
        ...data.metadata,
        ...(data.category === 'expenses' ? { original_category: 'expenses' } : {})
      };

      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: data.title || file.name,
          description: data.description,
          category: dbCategory,
          status: data.status || 'pending',
          version: data.version || 1,
          requires_approval: data.requires_approval || false,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          created_by: userId,
          uploaded_by: userId,
          company_id: companyId,
          employee_id: data.employee_id || null,
          document_type: data.document_type || null,
          department: data.department || null,
          approver_id: (data as any).approver_id || null,
          approval_requested_at: (data as any).approver_id ? new Date().toISOString() : null,
          metadata: enhancedMetadata,
          tags: data.tags || [],
          encrypted: false,
          version_number: 1,
          is_current_version: true,
          visibility_level: 'private',
          is_template: false,
          view_count: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Documents] Database insert error:', insertError);
        // Versuche die hochgeladene Datei zu löschen, wenn das Einfügen fehlschlägt
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Fehler beim Speichern des Dokuments: ${insertError.message}`);
      }

      console.log('[Documents] Document record created successfully', document);

      // Event emittieren
      await emitEvent(
        'document.uploaded',
        'document',
        document.id,
        'documents',
        {
          title: document.title,
          category: data.category,
          file_name: file.name,
          file_size: file.size,
          requires_approval: data.requires_approval,
          ai_analysis_enabled: enableAiAnalysis
        }
      );

      // KI-Analyse nur wenn aktiviert - SYNCHRON mit Ergebnis-Rückgabe
      let aiAnalysis = null;
      if (enableAiAnalysis) {
        try {
          console.log('[Documents] Starting AI analysis for document:', document.id);
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-document', {
            body: {
              documentId: document.id,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size
            }
          });

          if (analysisError) {
            console.error('[Documents] AI analysis error:', analysisError);
          } else {
            console.log('[Documents] AI analysis completed:', analysisData);
            aiAnalysis = analysisData?.analysis || null;
            
            // Auto-update document with AI-detected department if not set
            if (aiAnalysis?.detected_entities?.department && !data.department) {
              await supabase
                .from('documents')
                .update({ department: aiAnalysis.detected_entities.department })
                .eq('id', document.id);
              console.log('[Documents] Auto-set department from AI:', aiAnalysis.detected_entities.department);
            }

            // Auto-create expense entry if document is an invoice with valid amount
            const isExpenseDocument = data.category === 'expenses' || aiAnalysis?.document_type === 'Rechnung';
            const invoiceData = aiAnalysis?.invoice_data;
            
            if (isExpenseDocument && invoiceData?.total_amount && invoiceData.total_amount > 0) {
              try {
                console.log('[Documents] Creating expense entry for invoice:', invoiceData);
                
                // Create expense entry
                const { data: expense, error: expenseError } = await supabase
                  .from('expenses')
                  .insert({
                    company_id: companyId,
                    user_id: userId,
                    amount: invoiceData.total_amount,
                    currency: invoiceData.currency || 'EUR',
                    date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
                    description: `${invoiceData.vendor_name || 'Rechnung'} - ${invoiceData.invoice_number || document.title}`,
                    invoice_number: invoiceData.invoice_number || null,
                    vendor: invoiceData.vendor_name || null,
                    tax_amount: invoiceData.tax_amount || null,
                    category: 'invoice',
                    status: 'pending',
                    department: data.department || aiAnalysis?.detected_entities?.department || null,
                    submitted_at: new Date().toISOString()
                  })
                  .select()
                  .single();

                if (expenseError) {
                  console.error('[Documents] Failed to create expense:', expenseError);
                } else if (expense) {
                  console.log('[Documents] Expense created:', expense.id);
                  
                  // Link document to expense
                  const { error: linkError } = await supabase
                    .from('expense_documents')
                    .insert({
                      expense_id: expense.id,
                      company_id: companyId,
                      file_path: filePath,
                      file_name: file.name,
                      file_size: file.size,
                      file_type: file.type
                    });

                  if (linkError) {
                    console.error('[Documents] Failed to link document to expense:', linkError);
                  } else {
                    console.log('[Documents] Document linked to expense successfully');
                    
                    // Update document metadata with expense_id for reference
                    await supabase
                      .from('documents')
                      .update({
                        metadata: {
                          ...enhancedMetadata,
                          expense_id: expense.id,
                          expense_created: true
                        }
                      })
                      .eq('id', document.id);
                  }
                }
              } catch (expenseErr) {
                console.error('[Documents] Failed to create expense entry:', expenseErr);
              }
            }
          }
        } catch (analysisErr) {
          console.error('[Documents] Failed to complete AI analysis:', analysisErr);
        }
      }

      // Benachrichtigung an Freigeber senden wenn erforderlich
      const approverId = (data as any).approver_id;
      if (approverId && data.requires_approval) {
        try {
          console.log('[Documents] Sending approval notification to:', approverId);
          const { error: notifyError } = await supabase.functions.invoke('notify-document-approval', {
            body: {
              document_id: document.id,
              document_title: document.title,
              approver_id: approverId,
              requester_id: userId
            }
          });

          if (notifyError) {
            console.error('[Documents] Notification error:', notifyError);
          } else {
            console.log('[Documents] Approval notification sent successfully');
          }
        } catch (notifyErr) {
          console.error('[Documents] Failed to send notification:', notifyErr);
        }
      }

      return { document, aiAnalysis };
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  async updateDocument(id: string, data: Partial<Document>) {
    const { data: document, error } = await supabase
      .from('documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Event emittieren für Updates
    await emitEvent(
      'document.updated',
      'document',
      id,
      'documents',
      { updated_fields: Object.keys(data) }
    );
    
    return document as Document;
  },

  async deleteDocument(id: string) {
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, title')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) throw deleteError;
    
    // Event emittieren
    await emitEvent(
      'document.deleted',
      'document',
      id,
      'documents',
      { title: document.title }
    );
  },

  // Neue Methode: Dokumente zur Freigabe abrufen
  async getPendingApprovals(approverId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('approver_id', approverId)
      .eq('status', 'pending')
      .is('deleted_at', null)
      .order('approval_requested_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  // Neue Methode: Dokument freigeben
  async approveDocument(id: string, approverId: string) {
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Event emittieren
    await emitEvent(
      'document.approved',
      'document',
      id,
      'documents',
      { approved_by: approverId }
    );
    
    return document as Document;
  },

  // Neue Methode: Dokument ablehnen
  async rejectDocument(id: string, approverId: string, reason?: string) {
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status: 'rejected',
        approved_by: approverId,
        metadata: { rejection_reason: reason }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Event emittieren
    await emitEvent(
      'document.rejected',
      'document',
      id,
      'documents',
      { rejected_by: approverId, reason }
    );
    
    return document as Document;
  }
};