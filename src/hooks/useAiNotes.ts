import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import type { AiNote, AiNoteStatus, ParsedTransaction, Transaction, TransactionType } from '@/types/finance';

interface DeepSeekTransaction {
  type: 'Thu' | 'Chi' | 'Transfer';
  amount: number;
  category: string;
  account: string;
  description: string;
  datetime?: string;
  toAccount?: string;
}

export function useAiNotes() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { transactions, addTransaction, refetch: refetchTransactions } = useTransactions();
  const { toast } = useToast();

  const [notes, setNotes] = useState<AiNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Fetch notes from database
  const fetchNotes = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    // Cast the data to AiNote[]
    const typedNotes: AiNote[] = (data || []).map(note => ({
      id: note.id,
      user_id: note.user_id,
      raw_text: note.raw_text,
      parsed_data: (Array.isArray(note.parsed_data) ? note.parsed_data : null) as unknown as ParsedTransaction[] | null,
      status: note.status as AiNoteStatus,
      error_message: note.error_message,
      created_at: note.created_at,
      updated_at: note.updated_at,
    }));

    setNotes(typedNotes);
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Save a new note to queue (pending)
  const saveNote = async (text: string): Promise<boolean> => {
    if (!user || !text.trim()) return false;

    try {
      const { error } = await supabase
        .from('ai_notes')
        .insert({
          user_id: user.id,
          raw_text: text.trim(),
          status: 'pending' as AiNoteStatus,
        });

      if (error) throw error;

      await fetchNotes();
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu ghi chú',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update an existing note
  const updateNote = async (id: string, text: string): Promise<boolean> => {
    if (!user || !text.trim()) return false;

    try {
      const { error } = await supabase
        .from('ai_notes')
        .update({
          raw_text: text.trim(),
          status: 'pending' as AiNoteStatus,
          error_message: null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchNotes();
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật ghi chú',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a note
  const deleteNote = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ai_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchNotes();
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa ghi chú',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Learn category from transaction history
  const learnCategoryFromHistory = (
    description: string,
    aiSuggestedCategory: string,
    type: 'income' | 'expense'
  ): string => {
    if (!transactions || !description) return aiSuggestedCategory;

    const lowerDesc = description.toLowerCase().trim();
    const keywords = lowerDesc.split(/\s+/).filter(w => w.length > 1);
    if (keywords.length === 0) return aiSuggestedCategory;

    // Filter transactions by type
    const history = transactions
      .filter(t => t.type === type && t.description)
      .slice(0, 500);

    let bestMatchCategory: string | null = null;
    let maxScore = 0;

    for (const tx of history) {
      const oldDesc = (tx.description || '').toLowerCase();
      let score = 0;
      
      keywords.forEach(kw => {
        if (oldDesc.includes(kw)) score++;
      });
      
      if (oldDesc.includes(lowerDesc) || lowerDesc.includes(oldDesc)) {
        score += 5;
      }

      if (score > maxScore && tx.category) {
        maxScore = score;
        bestMatchCategory = tx.category.name;
      }
    }

    if (bestMatchCategory && maxScore >= 1 && bestMatchCategory.toLowerCase() !== 'khác') {
      // Verify category exists
      const validCats = categories.filter(c => c.type === type);
      const exists = validCats.some(c => c.name === bestMatchCategory);
      if (exists) return bestMatchCategory;
    }

    return aiSuggestedCategory;
  };

  // Find category ID by name
  const findCategoryId = (name: string, type: TransactionType): string | null => {
    const cat = categories.find(
      c => c.name.toLowerCase() === name.toLowerCase() && c.type === type
    );
    return cat?.id || null;
  };

  // Find account ID by name
  const findAccountId = (name: string): string | null => {
    const acc = accounts.find(
      a => a.name.toLowerCase() === name.toLowerCase()
    );
    return acc?.id || null;
  };

  // Process a single note with AI
  const processNote = async (noteId: string): Promise<boolean> => {
    if (!user || processingIds.has(noteId)) return false;

    const note = notes.find(n => n.id === noteId);
    if (!note || note.status === 'success') return false;

    setProcessingIds(prev => new Set(prev).add(noteId));

    try {
      // Update status to processing (in local state)
      setNotes(prev =>
        prev.map(n =>
          n.id === noteId ? { ...n, status: 'pending' as AiNoteStatus } : n
        )
      );

      // Prepare categories and accounts for AI
      const incomeCategories = categories
        .filter(c => c.type === 'income')
        .map(c => c.name);
      const expenseCategories = categories
        .filter(c => c.type === 'expense')
        .map(c => c.name);
      const accountNames = accounts.map(a => a.name);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('parse-note', {
        body: {
          text: note.raw_text,
          incomeCategories,
          expenseCategories,
          accounts: accountNames,
        },
      });

      if (error) throw new Error(error.message);

      const aiTransactions: DeepSeekTransaction[] = data?.transactions || [];

      if (aiTransactions.length === 0) {
        throw new Error('AI không tìm thấy giao dịch hợp lệ');
      }

      let createdCount = 0;
      const parsedData: ParsedTransaction[] = [];

      for (const tx of aiTransactions) {
        const amount = parseFloat(tx.amount?.toString() || '0');
        if (!Number.isFinite(amount) || amount <= 0) continue;

        // Map type
        let transactionType: TransactionType = 'expense';
        if (tx.type === 'Thu') transactionType = 'income';
        else if (tx.type === 'Transfer') transactionType = 'transfer';

        // Learn category from history
        const learnedCategory = learnCategoryFromHistory(
          tx.description || note.raw_text,
          tx.category || 'Khác',
          transactionType === 'income' ? 'income' : 'expense'
        );

        // Find IDs
        const categoryId = findCategoryId(learnedCategory, transactionType);
        const accountId = findAccountId(tx.account) || accounts[0]?.id;
        const toAccountId = tx.toAccount ? findAccountId(tx.toAccount) : null;

        if (!accountId) {
          console.warn('No account found for transaction');
          continue;
        }

        // Create transaction
        await addTransaction({
          type: transactionType,
          amount,
          category_id: categoryId,
          account_id: accountId,
          to_account_id: toAccountId,
          description: tx.description || note.raw_text,
          date: tx.datetime || new Date().toISOString(),
          is_recurring: false,
          recurring_id: null,
        });

        createdCount++;
        parsedData.push({
          type: transactionType,
          amount,
          description: tx.description || '',
          category_id: categoryId || undefined,
          suggested_category: learnedCategory,
        });
      }

      if (createdCount === 0) {
        throw new Error('Không tạo được giao dịch từ dữ liệu AI');
      }

      // Update note status to success
      await supabase
        .from('ai_notes')
        .update({
          status: 'success' as AiNoteStatus,
          parsed_data: parsedData as unknown as Record<string, never>[],
          error_message: null,
        })
        .eq('id', noteId);

      toast({
        title: 'Thành công!',
        description: `Đã tạo ${createdCount} giao dịch`,
      });

      await fetchNotes();
      await refetchTransactions();
      return true;

    } catch (error) {
      console.error('Error processing note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi xử lý AI';

      // Update note status to error
      await supabase
        .from('ai_notes')
        .update({
          status: 'error' as AiNoteStatus,
          error_message: errorMessage,
        })
        .eq('id', noteId);

      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });

      await fetchNotes();
      return false;

    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  };

  // Process all pending notes
  const processAllPending = async (): Promise<void> => {
    const pendingNotes = notes.filter(n => n.status === 'pending' || n.status === 'error');
    
    if (pendingNotes.length === 0) {
      toast({
        title: 'Thông báo',
        description: 'Không có ghi chú nào cần xử lý',
      });
      return;
    }

    setLoading(true);
    
    for (const note of pendingNotes) {
      await processNote(note.id);
    }

    setLoading(false);
  };

  // Get notes by status
  const pendingNotes = notes.filter(n => n.status === 'pending');
  const successNotes = notes.filter(n => n.status === 'success');
  const errorNotes = notes.filter(n => n.status === 'error');

  return {
    notes,
    pendingNotes,
    successNotes,
    errorNotes,
    loading,
    processingIds,
    saveNote,
    updateNote,
    deleteNote,
    processNote,
    processAllPending,
    fetchNotes,
  };
}
