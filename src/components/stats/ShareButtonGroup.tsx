import { useState } from 'react';
import { MessageCircle, Phone, Image, Copy, Check, Loader2 } from 'lucide-react';
import { 
  type ShareCardData, 
  formatWhatsAppReport, 
  shareToWhatsApp, 
  shareOrDownloadScoreImage 
} from '../../utils/shareUtils';

interface ShareButtonGroupProps {
  data: ShareCardData;
  className?: string;
}

export function ShareButtonGroup({ data, className = '' }: ShareButtonGroupProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageSharedStatus, setImageSharedStatus] = useState<'idle' | 'done'>('idle');

  // WhatsApp Share
  const handleWhatsApp = () => {
    const text = formatWhatsAppReport(data);
    shareToWhatsApp(text);
  };

  // Copy Plain Text
  const handleCopy = async () => {
    const text = formatWhatsAppReport(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Canvas Image Share / Download
  const handleImageShare = async () => {
    try {
      setIsGeneratingImage(true);
      await shareOrDownloadScoreImage(data);
      setImageSharedStatus('done');
      setTimeout(() => setImageSharedStatus('idle'), 2000);
    } catch (err) {
      console.error('Image share failed:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* WhatsApp Button with Authentic WhatsApp Brand Appearance */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="h-9 px-2.5 sm:px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 font-bold text-xs"
        title="WhatsApp ile Paylaş"
        aria-label="WhatsApp ile Paylaş"
      >
        <div className="relative flex items-center justify-center w-4.5 h-4.5 shrink-0">
          <MessageCircle size={18} className="text-white fill-white" />
          <Phone size={8} className="text-[#25D366] fill-[#25D366] absolute -rotate-[35deg] translate-x-[0.5px] -translate-y-[0.5px]" />
        </div>
        <span className="hidden xs:inline">WhatsApp</span>
      </button>

      {/* Image Card Share / Download Icon Button */}
      <button
        type="button"
        onClick={handleImageShare}
        disabled={isGeneratingImage}
        className="h-9 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs shrink-0 disabled:opacity-70 font-bold text-xs"
        title="Sonuç Kartını Resim Olarak Paylaş / İndir"
        aria-label="Sonuç Kartını Resim Olarak Paylaş / İndir"
      >
        {isGeneratingImage ? (
          <Loader2 size={16} className="animate-spin" />
        ) : imageSharedStatus === 'done' ? (
          <Check size={16} className="text-white" />
        ) : (
          <Image size={16} />
        )}
        <span className="hidden sm:inline">Kart</span>
      </button>

      {/* Copy Text Icon Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
        title="Rapor Metnini Kopyala"
        aria-label="Rapor Metnini Kopyala"
      >
        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
      </button>
    </div>
  );
}
