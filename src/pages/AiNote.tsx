import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Send, Check, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { supabase } from '@/integrations/supabase/client';
import type { AiNote, ParsedTransaction } from '@/types/finance';

// Simple parser for Vietnamese money notes
function parseNaturalLanguage(text: string, categories: { name: string; id: string; type: string }[]): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];
  
  // Split by comma or newline
  const parts = text.split(/[,\n]+/).map(p => p.trim()).filter(Boolean);
  
  for (const part of parts) {
    // Match patterns like "Lương 20M", "Ăn sáng 50k", "Taxi 100k"
    const moneyMatch = part.match(/(.+?)\s*(\d+(?:\.\d+)?)\s*([kmMK])?$/i);
    
    if (moneyMatch) {
      const description = moneyMatch[1].trim();
      let amount = parseFloat(moneyMatch[2]);
      const unit = moneyMatch[3]?.toLowerCase();
      
      // Convert units
      if (unit === 'k') amount *= 1000;
      if (unit === 'm') amount *= 1000000;
      
      // Try to match category
      const matchedCategory = categories.find(c => 
        description.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(description.toLowerCase())
      );
      
      // Determine type based on keywords or category
      const incomeKeywords = ['lương', 'salary', 'thưởng', 'bonus', 'thu nhập', 'income'];
      const isIncome = incomeKeywords.some(k => description.toLowerCase().includes(k)) ||
        matchedCategory?.type === 'income';
      
      results.push({
        type: isIncome ? 'income' : 'expense',
        amount,
        description,
        category_id: matchedCategory?.id,
        suggested_category: matchedCategory?.name,
      });
    }
  }
  
  return results;
}

export default function AiNotePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { addTransaction, refetch } = useTransactions();
  const { toast } = useToast();
  
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState<AiNote[]>([]);
  const [previewData, setPreviewData] = useState<ParsedTransaction[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch existing notes
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('ai_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotes(data as unknown as AiNote[]);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Preview parsing
    if (value.trim()) {
      const parsed = parseNaturalLanguage(value, categories.map(c => ({ 
        name: c.name, 
        id: c.id, 
        type: c.type 
      })));
      setPreviewData(parsed);
    } else {
      setPreviewData([]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || !user || accounts.length === 0) return;
    
    setProcessing(true);
    
    try {
      const parsed = parseNaturalLanguage(input, categories.map(c => ({ 
        name: c.name, 
        id: c.id, 
        type: c.type 
      })));
      
      if (parsed.length === 0) {
        toast({
          title: 'Không hiểu được',
          description: 'Vui lòng thử lại với định dạng: "Mô tả số tiền" (ví dụ: "Ăn sáng 50k")',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      
      // Save AI note
      await supabase
        .from('ai_notes')
        .insert({
          user_id: user.id,
          raw_text: input,
          parsed_data: parsed as unknown as Record<string, never>[],
          status: 'success',
        });
      
      // Create transactions
      const defaultAccountId = accounts[0].id;
      
      for (const item of parsed) {
        await addTransaction({
          type: item.type,
          amount: item.amount,
          category_id: item.category_id || null,
          account_id: defaultAccountId,
          to_account_id: null,
          description: item.description,
          date: new Date().toISOString(),
          is_recurring: false,
          recurring_id: null,
        });
      }
      
      toast({
        title: 'Thành công!',
        description: `Đã thêm ${parsed.length} giao dịch`,
      });
      
      setInput('');
      setPreviewData([]);
      fetchNotes();
      refetch();
      
    } catch (error) {
      console.error('Error processing note:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xử lý ghi chú',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Magic Note</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Nhập ghi chú tự nhiên để thêm giao dịch nhanh. Ví dụ:
          </p>
          <div className="text-sm bg-muted/50 p-3 rounded-lg mb-4 font-mono">
            Lương 20M, Ăn sáng 50k, Taxi 100k
          </div>
          
          <Textarea
            placeholder="Nhập ghi chú của bạn..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            className="min-h-24 resize-none"
          />
          
          {/* Preview */}
          {previewData.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Xem trước:</p>
              {previewData.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-sm",
                    item.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                  )}
                >
                  <div>
                    <span className="font-medium">{item.description}</span>
                    {item.suggested_category && (
                      <span className="text-muted-foreground ml-2">
                        → {item.suggested_category}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "font-semibold",
                    item.type === 'income' ? 'text-income' : 'text-expense'
                  )}>
                    {item.type === 'income' ? '+' : '-'}
                    <CurrencyDisplay amount={item.amount} />
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={processing || !input.trim()}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Xử lý & Thêm giao dịch
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {notes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lịch sử ghi chú</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-start gap-2">
                  {note.status === 'success' ? (
                    <Check className="h-4 w-4 text-income mt-1" />
                  ) : note.status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-destructive mt-1" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                  )}
                  <div>
                    <p className="text-sm">{note.raw_text}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
