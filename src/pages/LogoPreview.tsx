import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '@/components/icons/AppLogo';
import { toast } from 'sonner';

type LogoVariant = 'chart' | 'currency' | 'grid';

interface ExportSize {
  name: string;
  size: number;
  filename: string;
}

const EXPORT_SIZES: ExportSize[] = [
  { name: 'Favicon', size: 32, filename: 'favicon.png' },
  { name: 'Apple Touch', size: 180, filename: 'apple-touch-icon.png' },
  { name: 'PWA 192', size: 192, filename: 'pwa-192x192.png' },
  { name: 'PWA 512', size: 512, filename: 'pwa-512x512.png' },
];

const VARIANTS: { value: LogoVariant; label: string; description: string }[] = [
  { value: 'chart', label: 'Chart Growth', description: 'Biểu đồ tăng trưởng với đường trend' },
  { value: 'currency', label: 'Currency Circle', description: 'Ký hiệu $ trong vòng tròn kỹ thuật' },
  { value: 'grid', label: 'Dashboard Grid', description: 'Grid 4 ô dashboard style' },
];

export default function LogoPreview() {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant>('chart');
  const [exporting, setExporting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const exportToPNG = useCallback(async (size: number, filename: string) => {
    setExporting(filename);
    
    try {
      // Create a temporary SVG element
      const svgElement = document.getElementById('export-logo');
      if (!svgElement) {
        throw new Error('Logo not found');
      }

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      
      // Create blob from SVG
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create image from SVG
      const img = new Image();
      img.onload = () => {
        // Draw to canvas at target size
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Draw with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        
        // Export as PNG
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          
          const downloadUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(url);
          
          toast.success(`Đã xuất ${filename}`);
          setExporting(null);
        }, 'image/png');
      };
      
      img.onerror = () => {
        toast.error('Lỗi khi xuất hình ảnh');
        setExporting(null);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất hình ảnh');
      setExporting(null);
    }
  }, []);

  const exportAll = useCallback(async () => {
    for (const { size, filename } of EXPORT_SIZES) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          exportToPNG(size, filename);
          resolve();
        }, 500);
      });
    }
  }, [exportToPNG]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold font-mono">LOGO_PREVIEW</h1>
            <p className="text-xs text-muted-foreground">Industrial-Tech App Icon</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Variant Selection */}
        <section>
          <h2 className="text-sm font-mono text-muted-foreground mb-3">SELECT_VARIANT</h2>
          <div className="grid grid-cols-1 gap-3">
            {VARIANTS.map((variant) => (
              <button
                key={variant.value}
                onClick={() => setSelectedVariant(variant.value)}
                className={`
                  p-4 text-left border-2 transition-all
                  ${selectedVariant === variant.value 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold">{variant.label}</div>
                    <div className="text-sm text-muted-foreground">{variant.description}</div>
                  </div>
                  {selectedVariant === variant.value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Main Preview */}
        <section>
          <h2 className="text-sm font-mono text-muted-foreground mb-3">PREVIEW_512x512</h2>
          <div className="flex justify-center p-8 bg-muted/30 border">
            <div id="export-logo">
              <AppLogo size={512} variant={selectedVariant} />
            </div>
          </div>
        </section>

        {/* Size Previews */}
        <section>
          <h2 className="text-sm font-mono text-muted-foreground mb-3">SIZE_VARIANTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXPORT_SIZES.map(({ name, size, filename }) => (
              <div key={filename} className="text-center">
                <div className="flex justify-center items-center p-4 bg-muted/30 border min-h-[120px]">
                  <AppLogo size={size} variant={selectedVariant} />
                </div>
                <div className="mt-2">
                  <div className="text-sm font-mono">{name}</div>
                  <div className="text-xs text-muted-foreground">{size}x{size}px</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Background Preview */}
        <section>
          <h2 className="text-sm font-mono text-muted-foreground mb-3">BACKGROUND_TEST</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-white flex justify-center items-center border">
              <AppLogo size={128} variant={selectedVariant} />
            </div>
            <div className="p-8 bg-black flex justify-center items-center border">
              <AppLogo size={128} variant={selectedVariant} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 text-center text-xs text-muted-foreground">
            <div>Light Background</div>
            <div>Dark Background</div>
          </div>
        </section>

        {/* Export Buttons */}
        <section>
          <h2 className="text-sm font-mono text-muted-foreground mb-3">EXPORT_PNG</h2>
          <div className="grid grid-cols-2 gap-3">
            {EXPORT_SIZES.map(({ name, size, filename }) => (
              <Button
                key={filename}
                variant="outline"
                onClick={() => exportToPNG(size, filename)}
                disabled={exporting !== null}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                {name} ({size}px)
              </Button>
            ))}
          </div>
          <Button 
            className="w-full mt-4" 
            onClick={exportAll}
            disabled={exporting !== null}
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất tất cả kích thước
          </Button>
        </section>

        {/* Instructions */}
        <section className="p-4 bg-muted/30 border text-sm">
          <h3 className="font-mono font-bold mb-2">HƯỚNG_DẪN</h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Chọn variant phù hợp với phong cách app</li>
            <li>Xuất các file PNG theo từng kích thước</li>
            <li>Copy các file vào thư mục <code className="bg-muted px-1">public/</code></li>
            <li>Thay thế các icon hiện tại</li>
          </ol>
        </section>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
