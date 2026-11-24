import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { sound } from '../../services/sound';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenDownloadModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenDownloadModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone and no download modal provided, hide
  if (isInstalled && !onOpenDownloadModal) {
    return null;
  }

  const handleClick = async () => {
    sound.playClick();
    if (onOpenDownloadModal) {
      onOpenDownloadModal();
      return;
    }

    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-extrabold text-xs shadow-md shadow-emerald-900/40 transition cursor-pointer shrink-0"
        title="ទាញយក App (.APK & .IPA)"
      >
        <Download size={14} className="animate-bounce" />
        <span className="hidden xs:inline">ទាញយក App</span>
        <span className="xs:hidden">App</span>
      </button>

      {/* iOS Safari Guided Instructions Modal */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#0c160f] border border-[#1f3724] p-5 shadow-2xl text-center relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Smartphone size={24} />
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              ដំឡើងលើ iPhone / iPad
            </h3>

            <div className="text-xs text-gray-300 text-left space-y-2.5 bg-[#122216] p-3.5 rounded-2xl border border-[#1d3824] mb-4">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>ចុចលើប៊ូតុង <strong>Share</strong> (សញ្ញាព្រួញឡើងលើ <Share2 size={12} className="inline text-blue-400" />) នៅខាងក្រោម Safari</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>អូសចុះក្រោម រួចចុច <strong>"Add to Home Screen (បន្ថែមទៅអេក្រង់ដើម)"</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>ចុច <strong>"Add"</strong> នៅជ្រុងខាងស្តាំលើដើម្បីរួចរាល់!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition"
            >
              យល់ព្រម (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
