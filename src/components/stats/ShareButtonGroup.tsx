import { useState } from 'react';
import { MessageCircle, Image, Copy, Check, Loader2 } from 'lucide-react';
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
      {/* WhatsApp Icon Button */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shadow-2xs shrink-0"
        title="WhatsApp'ta Paylaş"
        aria-label="WhatsApp'ta Paylaş"
      >
        <MessageCircle size={16} className="fill-white/20" />
      </button>

      {/* Image Card Share / Download Icon Button */}
      <button
        type="button"
        onClick={handleImageShare}
        disabled={isGeneratingImage}
        className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shadow-2xs shrink-0 disabled:opacity-70"
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
