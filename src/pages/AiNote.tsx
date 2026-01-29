import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAiNotes } from '@/hooks/useAiNotes';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Save, 
  Zap, 
  Check, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Pencil, 
  Trash2,
  Wand2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import type { AiNote } from '@/types/finance';

export default function AiNotePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const {
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
  } = useAiNotes();

  const [input, setInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSaveOrUpdate = async () => {
    if (!input.trim()) {
      if (editingNoteId) {
        // Cancel edit mode
        setEditingNoteId(null);
        setInput('');
      } else {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập nội dung ghi chú',
          variant: 'destructive',
        });
      }
      return;
    }

    let success = false;
    if (editingNoteId) {
      success = await updateNote(editingNoteId, input);
      if (success) {
        setEditingNoteId(null);
        setInput('');
        toast({
          title: 'Đã cập nhật',
          description: 'Ghi chú đã được cập nhật',
        });
      }
    } else {
      success = await saveNote(input);
      if (success) {
        setInput('');
        toast({
          title: 'Đã lưu',
          description: 'Ghi chú đã được lưu vào hàng đợi',
        });
      }
    }
  };

  const handleEditNote = (note: AiNote) => {
    setEditingNoteId(note.id);
    setInput(note.raw_text);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setInput('');
  };

  const handleDeleteNote = async (id: string) => {
    if (editingNoteId === id) {
      toast({
        title: 'Lỗi',
        description: 'Đang chỉnh sửa ghi chú này, hãy hủy sửa trước',
        variant: 'destructive',
      });
      return;
    }
    await deleteNote(id);
  };

  const handleProcessNote = async (id: string) => {
    if (editingNoteId === id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng lưu chỉnh sửa trước khi xử lý',
        variant: 'destructive',
      });
      return;
    }
    await processNote(id);
  };

  const getStatusBadge = (note: AiNote) => {
    const isProcessing = processingIds.has(note.id);
    
    if (isProcessing) {
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang xử lý
        </Badge>
      );
    }

    switch (note.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Chờ xử lý
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="success" className="gap-1">
            <Check className="h-3 w-3" />
            Hoàn thành
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="error" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Lỗi
          </Badge>
        );
      default:
        return null;
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

  const unprocessedNotes = [...pendingNotes, ...errorNotes];

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Magic Note</h1>
      </div>

      {/* Input Card */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Nhập ghi chú tự nhiên, AI sẽ tự động phân tích và tạo giao dịch:
          </p>
          <div className="text-sm bg-muted/50 p-3 rounded-lg mb-4 font-mono">
            Lương 20M, Ăn sáng 50k, Taxi grab 100k
          </div>
          
          <Textarea
            placeholder="Nhập ghi chú của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-24 resize-none"
          />

          {editingNoteId && (
            <p className="text-sm text-primary mt-2 flex items-center gap-1">
              <Pencil className="h-3 w-3" />
              Đang chỉnh sửa ghi chú
            </p>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              variant={editingNoteId ? "default" : "outline"}
              className="flex-1"
              onClick={handleSaveOrUpdate}
              disabled={!input.trim() && !editingNoteId}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingNoteId ? 'Cập nhật' : 'Lưu ghi chú'}
            </Button>
            
            {editingNoteId ? (
              <Button variant="ghost" onClick={handleCancelEdit}>
                Hủy
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={processAllPending}
                disabled={loading || unprocessedNotes.length === 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Xử lý tất cả ({unprocessedNotes.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Notes */}
      {unprocessedNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Chờ xử lý ({unprocessedNotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unprocessedNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-3 rounded-lg border",
                  note.status === 'error' ? 'border-destructive/50 bg-destructive/5' : 'bg-muted/30',
                  editingNoteId === note.id && 'ring-2 ring-primary'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {note.raw_text}
                    </p>
                    {note.error_message && (
                      <p className="text-xs text-destructive mt-1">
                        {note.error_message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(note)}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditNote(note)}
                        disabled={processingIds.has(note.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleProcessNote(note.id)}
                        disabled={processingIds.has(note.id)}
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={processingIds.has(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processed Notes */}
      {successNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-income" />
              Đã xử lý ({successNotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {successNotes.slice(0, 10).map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-income/5 border border-income/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {note.raw_text}
                    </p>
                    {note.parsed_data && note.parsed_data.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {note.parsed_data.map((tx, idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              "text-sm flex items-center gap-2",
                              tx.type === 'income' ? 'text-income' : 'text-expense'
                            )}
                          >
                            <span>{tx.suggested_category || tx.description}</span>
                            <span className="font-medium">
                              {tx.type === 'income' ? '+' : '-'}
                              <CurrencyDisplay amount={tx.amount} />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(note)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {notes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có ghi chú nào</p>
            <p className="text-sm mt-1">
              Nhập ghi chú phía trên để bắt đầu
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
