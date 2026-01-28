import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useDataBackup } from '@/hooks/useDataBackup';
import { useLegacyImport } from '@/hooks/useLegacyImport';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2, 
  HardDrive,
  Clock,
  FileJson,
  DatabaseBackup,
  ArrowDownToLine
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function DataBackupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { 
    loading, 
    getSaveSlots, 
    saveToLocal, 
    loadFromLocal, 
    deleteSaveSlot,
    downloadBackup,
    uploadBackup 
  } = useDataBackup();
  const { 
    loading: legacyLoading, 
    progress: legacyProgress, 
    importLegacyData,
    importCategoriesOnly 
  } = useLegacyImport();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const legacyFileInputRef = useRef<HTMLInputElement>(null);
  const categoriesFileInputRef = useRef<HTMLInputElement>(null);
  const [saveSlots, setSaveSlots] = useState<ReturnType<typeof getSaveSlots>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showLegacyProgress, setShowLegacyProgress] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setSaveSlots(getSaveSlots());
  }, []);

  const refreshSlots = () => {
    setSaveSlots(getSaveSlots());
  };

  const handleSave = async () => {
    const success = await saveToLocal(saveName || undefined);
    if (success) {
      toast({
        title: 'Lưu thành công',
        description: 'Dữ liệu đã được lưu vào bộ nhớ cục bộ',
      });
      refreshSlots();
      setShowSaveDialog(false);
      setSaveName('');
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu dữ liệu',
        variant: 'destructive',
      });
    }
  };

  const handleLoad = async (slotId: string) => {
    const success = await loadFromLocal(slotId);
    if (success) {
      toast({
        title: 'Khôi phục thành công',
        description: 'Dữ liệu đã được khôi phục. Vui lòng tải lại trang.',
      });
      window.location.reload();
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể khôi phục dữ liệu',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (slotId: string) => {
    deleteSaveSlot(slotId);
    refreshSlots();
    toast({
      title: 'Đã xóa',
      description: 'Bản lưu đã được xóa',
    });
  };

  const handleDownload = async () => {
    const success = await downloadBackup();
    if (success) {
      toast({
        title: 'Tải xuống thành công',
        description: 'File backup đã được tải xuống',
      });
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải xuống backup',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const success = await uploadBackup(file);
    if (success) {
      toast({
        title: 'Khôi phục thành công',
        description: 'Dữ liệu đã được khôi phục từ file. Vui lòng tải lại trang.',
      });
      window.location.reload();
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể khôi phục từ file',
        variant: 'destructive',
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLegacyImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowLegacyProgress(true);
    const result = await importLegacyData(file);
    
    if (result.success) {
      toast({
        title: 'Import thành công',
        description: result.message,
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast({
        title: 'Lỗi import',
        description: result.message,
        variant: 'destructive',
      });
      setShowLegacyProgress(false);
    }

    // Reset input
    if (legacyFileInputRef.current) {
      legacyFileInputRef.current.value = '';
    }
  };

  const handleCategoriesImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowLegacyProgress(true);
    const result = await importCategoriesOnly(file);
    
    if (result.success) {
      toast({
        title: 'Import thành công',
        description: result.message,
        duration: 3000,
      });
      setShowLegacyProgress(false);
    } else {
      toast({
        title: 'Lỗi import',
        description: result.message,
        variant: 'destructive',
      });
      setShowLegacyProgress(false);
    }

    // Reset input
    if (categoriesFileInputRef.current) {
      categoriesFileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (authLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HardDrive className="h-6 w-6" />
        Sao lưu & Khôi phục
      </h1>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start" variant="outline">
                <Save className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Lưu (Save)</p>
                  <p className="text-xs text-muted-foreground">Lưu vào bộ nhớ cục bộ</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lưu dữ liệu</DialogTitle>
                <DialogDescription>
                  Tạo một bản lưu mới trong bộ nhớ cục bộ
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Tên bản lưu (tùy chọn)"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleDownload}
            disabled={loading}
          >
            <Download className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Tải xuống (Download)</p>
              <p className="text-xs text-muted-foreground">Xuất file JSON để lưu vào NAS</p>
            </div>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleUpload}
          />
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Tải lên (Upload)</p>
              <p className="text-xs text-muted-foreground">Khôi phục từ file JSON</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Legacy Import */}
      <Card className="border-dashed border-primary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5 text-primary" />
            Import dữ liệu cũ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Import dữ liệu từ ứng dụng Finance Tracker phiên bản cũ (file JSON có cấu trúc financial_transactions_v2)
          </p>
          
          {showLegacyProgress && legacyLoading && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>{legacyProgress.status}</span>
                <span>{legacyProgress.current}/{legacyProgress.total}</span>
              </div>
              <Progress value={legacyProgress.total > 0 ? (legacyProgress.current / legacyProgress.total) * 100 : 0} />
            </div>
          )}

          <input
            ref={legacyFileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleLegacyImport}
          />
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => legacyFileInputRef.current?.click()}
            disabled={loading || legacyLoading}
          >
            <ArrowDownToLine className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Import toàn bộ dữ liệu cũ</p>
              <p className="text-xs text-muted-foreground">Xóa dữ liệu hiện tại và import từ file JSON</p>
            </div>
          </Button>

          <input
            ref={categoriesFileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleCategoriesImport}
          />
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => categoriesFileInputRef.current?.click()}
            disabled={loading || legacyLoading}
          >
            <DatabaseBackup className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Chỉ import danh mục</p>
              <p className="text-xs text-muted-foreground">Thêm danh mục mới từ file JSON (không xóa dữ liệu)</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Save Slots */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Danh sách bản lưu ({saveSlots.length}/20)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {saveSlots.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Chưa có bản lưu nào
            </p>
          ) : (
            <div className="space-y-2">
              {saveSlots.map((slot) => (
                <div 
                  key={slot.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="font-medium truncate">{slot.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(slot.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                      <span>{formatSize(slot.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Khôi phục dữ liệu?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dữ liệu hiện tại sẽ bị thay thế bởi bản lưu này. 
                            Bạn có chắc chắn muốn tiếp tục?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleLoad(slot.id)}>
                            Khôi phục
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa bản lưu?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bản lưu này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(slot.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
