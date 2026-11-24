import React, { useState, useEffect, useRef } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  Download,
  Check,
  ShieldCheck,
  Upload,
  RotateCcw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import QRCode from 'qrcode';

interface KhqrCardProps {
  amountUsd: number;
  amountKhr: number;
  packageName: string;
  isExpired?: boolean;
  timeLeftFormatted?: string;
  onRegenerate?: () => void;
}

export const KhqrCard: React.FC<KhqrCardProps> = ({
  amountUsd,
  amountKhr,
  isExpired = false,
  timeLeftFormatted,
  onRegenerate,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const merchantName = appState.config.merchantName || 'BIN SOPHA';
  
  // Persisted user uploaded direct screenshot
  const [uploadedImage, setUploadedImage] = useState<string | null>(() => {
    return localStorage.getItem('aof_user_uploaded_qr') || null;
  });

  // Calculate CRC16-CCITT for NBC Bakong KHQR EMVCo Standard
  const calculateCrc16 = (str: string): string => {
    let crc = 0xffff;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  // High-Density Authentic EMVCo KHQR Payload (NBC Bakong Standard)
  const getKhqrPayload = (): string => {
    const amountStr = amountUsd.toFixed(2);
    const tag54 = '54' + amountStr.length.toString().padStart(2, '0') + amountStr;
    const base =
      '000201010212' +
      '29390016cnbakhpp@cnba0111sopha.bin@cnba' +
      '30280016bakong@nbc.org.kh010800000001' +
      '520459995303840' +
      tag54 +
      '5802KH5909BIN SOPHA6010Phnom Penh62280112AppleFortune0708BAKONG016304';
    return base + calculateCrc16(base);
  };

  // Helper for drawing soft rounded rectangles
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Draw clean Canadia Bank Center Emblem
  const drawSmoothCanadiaLogo = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
    ctx.save();
    // 1. Clean protective pure white circular ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 2. Solid Deep Red Circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#c02626';
    ctx.fill();

    // 3. Thin white inner concentric circle
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.82, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Soft rounded dual squares
    const boxSize = radius * 1.05;
    const halfBox = boxSize / 2;
    const cornerR = radius * 0.24;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.4, radius * 0.1);

    // First rounded square
    drawRoundedRect(ctx, center - halfBox, center - halfBox, boxSize, boxSize, cornerR);
    ctx.stroke();

    // Second rounded square rotated 45 degrees
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(Math.PI / 4);
    drawRoundedRect(ctx, -halfBox, -halfBox, boxSize, boxSize, cornerR);
    ctx.stroke();
    ctx.restore();

    // 5. Bold clean white "C" in center
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(radius * 0.62)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', center, center + 0.5);

    ctx.restore();
  };

  // Render high-resolution QR code
  useEffect(() => {
    if (!uploadedImage && canvasRef.current) {
      const payload = getKhqrPayload();
      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 180,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (err) => {
          if (!err && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;
            const center = canvasRef.current.width / 2;
            const radius = Math.round(canvasRef.current.width * 0.092);
            drawSmoothCanadiaLogo(ctx, center, radius);
          }
        }
      );
    }
  }, [uploadedImage, amountUsd]);

  // Handle direct file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUploadedImage(result);
          localStorage.setItem('aof_user_uploaded_qr', result);
          sound.playCompleteFanfare();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset uploaded image back to default QR
  const handleResetQr = () => {
    sound.playClick();
    setUploadedImage(null);
    localStorage.removeItem('aof_user_uploaded_qr');
  };

  // Download crisp QR image
  const handleDownload = () => {
    sound.playClick();
    let downloadUrl = uploadedImage;
    if (!downloadUrl && canvasRef.current) {
      downloadUrl = canvasRef.current.toDataURL('image/png');
    }

    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `KHQR_BIN_SOPHA_${amountUsd}USD.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[210px] mx-auto select-none">
      
      {/* Official Authentic KHQR Card - Smooth Clean Design */}
      <div className="relative w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Red KHQR Top Curved Banner */}
        <div className="bg-[#E21A1A] pt-2 pb-1.5 px-3.5 flex items-center justify-between text-white">
          <span className="font-black text-base tracking-wider font-sans">KHQR</span>
          {isExpired ? (
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-red-950 px-2 py-0.5 rounded-full border border-red-300 text-red-200 animate-pulse">
              EXPIRED
            </span>
          ) : timeLeftFormatted ? (
            <span className="text-[10px] font-black font-mono bg-black/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock size={11} className="text-yellow-300 animate-spin" />
              <span>{timeLeftFormatted}</span>
            </span>
          ) : (
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/20 px-1.5 py-0.2 rounded-full">
              BAKONG
            </span>
          )}
        </div>

        {/* Beneficiary Name */}
        <div className="bg-white px-3.5 pt-2 pb-0.5">
          <div className="text-left">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
              ឈ្មោះគណនី (BENEFICIARY)
            </span>
            <span className="text-sm font-black text-gray-900 tracking-wide font-sans block truncate">
              {merchantName}
            </span>
          </div>

          {/* Grey Dashed Line */}
          <div className="w-full border-b border-dashed border-gray-300 mt-1.5 mb-1"></div>
        </div>

        {/* Authentic KHQR Code */}
        <div className="p-2 flex flex-col items-center justify-center bg-white relative">
          <div className={`relative w-[165px] h-[165px] rounded-lg overflow-hidden flex items-center justify-center bg-white ${isExpired ? 'opacity-30 blur-[1px]' : ''}`}>
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Bakong KHQR - BIN SOPHA"
                className="w-full h-full object-contain"
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                width={180}
                height={180}
              />
            )}
          </div>

          {/* Expired Overlay if 5 mins time is up */}
          {isExpired && (
            <div className="absolute inset-2 bg-black/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-2 text-center z-20 animate-in fade-in">
              <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-1">
                <AlertTriangle size={18} />
              </div>
              <span className="text-xs font-black text-red-400 leading-tight">
                QR ផុតកំណត់ (Expired)
              </span>
              <span className="text-[9px] text-gray-300 mt-0.5">
                មិនដំណើរការទៀតទេ (Not Work)
              </span>
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer shadow-md"
                >
                  <RotateCcw size={11} />
                  <span>បង្កើត QR ថ្មី</span>
                </button>
              )}
            </div>
          )}

          {/* Amount Badge */}
          <div className="w-full mt-1.5 py-1 px-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-gray-600">ត្រូវបង់:</span>
            <div className="text-right">
              <span className="text-xs font-black text-[#E21A1A]">${amountUsd}.00</span>
              <span className="text-[9px] text-gray-500 font-semibold ml-1">
                ({amountKhr.toLocaleString()} ៛)
              </span>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="px-2 pb-2 pt-0.5 bg-white border-t border-gray-100 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-1.5 px-2 rounded-lg bg-[#0f1d13] hover:bg-black text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            {downloaded ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span>បាន Save QR</span>
              </>
            ) : (
              <>
                <Download size={12} />
                <span>Save QR Code</span>
              </>
            )}
          </button>

          {uploadedImage && (
            <button
              type="button"
              onClick={handleResetQr}
              className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-gray-200"
              title="កំណត់ QR ដើមឡើងវិញ"
            >
              <RotateCcw size={11} />
              <span>កំណត់ដើម</span>
            </button>
          )}

          {!uploadedImage && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-gray-200"
              title="ជ្រើសរើសរូប QR ផ្ទាល់ខ្លួន"
            >
              <Upload size={11} />
              <span>ប្តូររូប</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Red bottom accent */}
        <div className="h-1 bg-[#E21A1A] w-full" />
      </div>

      {/* Verification footer */}
      <div className="mt-1.5 text-center text-[9px] text-emerald-400 font-medium flex items-center justify-center gap-1">
        <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
        <span>ស្កេនបានគ្រប់ App (Canadia, ABA...)</span>
      </div>

    </div>
  );
};
