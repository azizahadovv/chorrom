import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EditModeToggle } from '@/components/EditModeToggle';
import { EditorPanel } from '@/components/editor/EditorPanel';

/** Saytdagi admin tahrirlash vositalari: faqat tahrirlash huquqi bor foydalanuvchiga alohida chunk bo'lib yuklanadi. */
export default function AdminTools() {
  return (
    <TooltipProvider>
      <Toaster />
      <EditModeToggle />
      <EditorPanel />
    </TooltipProvider>
  );
}
