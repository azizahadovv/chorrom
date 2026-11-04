import '@/index.css';
import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Type, Image as ImageIcon, Check, Link2 } from 'lucide-react';
import { useEditMode } from '@/hooks/useEditMode';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useLanguage } from '@/hooks/useLanguage';
import { db as supabase } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function EditorPanel() {
  const { selectedElement, selectElement, isPanelOpen, setIsPanelOpen, setHasUnsavedChanges } = useEditMode();
  const { getContent, updateContent } = useSiteContent();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update edit value when selected element changes
  useEffect(() => {
    if (selectedElement) {
      const currentValue = getContent(selectedElement.contentKey, language, selectedElement.fallback || '');
      setEditValue(currentValue);
    }
  }, [selectedElement, language, getContent]);

  const handleClose = () => {
    setIsPanelOpen(false);
    selectElement(null);
  };

  const handleSaveText = async () => {
    if (!selectedElement) return;
    
    setSaving(true);
    setHasUnsavedChanges(true);
    
    const success = await updateContent(selectedElement.contentKey, language, editValue);
    
    setSaving(false);
    
    if (success) {
      setHasUnsavedChanges(false);
      toast({
        title: 'Saqlandi',
        description: 'Matn muvaffaqiyatli yangilandi',
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'Faqat rasm fayllari qabul qilinadi',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'Rasm hajmi 5MB dan oshmasligi kerak',
      });
      return;
    }

    setIsUploading(true);
    setHasUnsavedChanges(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedElement.contentKey}-${Date.now()}.${fileExt}`;
      const filePath = `site-content/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Save URL to site_content
      await updateContent(selectedElement.contentKey, 'uz', publicUrl);
      await updateContent(selectedElement.contentKey, 'ru', publicUrl);

      setEditValue(publicUrl);
      setHasUnsavedChanges(false);
      
      toast({
        title: 'Saqlandi',
        description: 'Rasm muvaffaqiyatli yangilandi',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: error.message || 'Rasmni yuklashda xatolik yuz berdi',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[380px] bg-card border-l shadow-2xl z-50",
          "transform transition-transform duration-300 ease-out",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {selectedElement?.type === 'text' ? (
              <Type className="h-4 w-4 text-primary" />
            ) : selectedElement?.type === 'link' ? (
              <Link2 className="h-4 w-4 text-primary" />
            ) : (
              <ImageIcon className="h-4 w-4 text-primary" />
            )}
            <h3 className="font-semibold">
              {selectedElement?.type === 'text' 
                ? "Matnni tahrirlash" 
                : selectedElement?.type === 'link'
                  ? "Havolani tahrirlash"
                  : "Rasmni tahrirlash"}
            </h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-120px)]">
          {selectedElement ? (
            <>
              {/* Section info */}
              <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <span className="font-medium">Kalit:</span> {selectedElement.contentKey}
                {selectedElement.section && (
                  <span className="ml-2">
                    <span className="font-medium">Bo'lim:</span> {selectedElement.section}
                  </span>
                )}
              </div>

              {selectedElement.type === 'text' ? (
                /* Text Editor */
                <div className="space-y-3">
                  <label className="text-sm font-medium">Matn ({language.toUpperCase()})</label>
                  {selectedElement.multiline ? (
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={6}
                      className="resize-y"
                      placeholder="Matn kiriting..."
                    />
                  ) : (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Matn kiriting..."
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Hozirgi til: {language === 'uz' ? "O'zbek" : "Русский"}
                  </p>
                </div>
              ) : selectedElement.type === 'link' ? (
                /* Link Editor */
                <div className="space-y-3">
                  <label className="text-sm font-medium">Havola URL</label>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    To'liq URL manzilini kiriting (https:// bilan)
                  </p>
                  {editValue && (
                    <a 
                      href={editValue} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Link2 className="h-3 w-3" />
                      Havolani tekshirish
                    </a>
                  )}
                </div>
              ) : (
                /* Image Editor */
                <div className="space-y-4">
                  {/* Current image preview */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hozirgi rasm</label>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                      <img 
                        src={editValue || selectedElement.fallback} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Upload area */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                      isUploading 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Yangi rasm yuklash</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP (max 5MB)
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Element tanlang</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {(selectedElement?.type === 'text' || selectedElement?.type === 'link') && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t">
            <Button 
              onClick={handleSaveText}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}