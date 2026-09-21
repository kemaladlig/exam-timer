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
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* WhatsApp Button */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
        title="WhatsApp'ta Paylaş"
      >
        <MessageCircle size={14} className="fill-white/20" />
        <span>WhatsApp</span>
      </button>

      {/* Image Card Share / Download Button */}
      <button
        type="button"
        onClick={handleImageShare}
        disabled={isGeneratingImage}
        className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0 disabled:opacity-70"
        title="Sonuç Kartını Resim Olarak Paylaş veya İndir"
      >
        {isGeneratingImage ? (
          <Loader2 size={14} className="animate-spin" />
        ) : imageSharedStatus === 'done' ? (
          <Check size={14} className="text-white" />
        ) : (
          <Image size={14} />
        )}
        <span>{imageSharedStatus === 'done' ? 'Hazırlandı' : 'Kart Resmi'}</span>
      </button>

      {/* Copy Text Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        title="Metin Olarak Kopyala"
      >
        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        <span className="hidden xs:inline">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
      </button>
    </div>
  );
}
