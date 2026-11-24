import React, { useState } from 'react';
import { sound } from '../../services/sound';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Palette,
  Layers,
  Zap,
  Info,
} from 'lucide-react';

interface AppleAssetStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenStyle: 'classic_vector' | 'realism_wood';
  onSelectTokenStyle: (style: 'classic_vector' | 'realism_wood') => void;
}

export const AppleAssetStudioModal: React.FC<AppleAssetStudioModalProps> = ({
  isOpen,
  onClose,
  tokenStyle,
  onSelectTokenStyle,
}) => {
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const promptWin = `A high-quality 3D render mobile game icon for "Apple of Fortune", showing a delicious glossy fresh red apple with a green leaf and tiny water droplets, centered on top of a circular emerald-green metallic medallion with a bright neon green glowing circular border, clean dark purple-black UI background, isometric 3D game asset, 8k resolution, ray-traced lighting, casino UI style, hyper-detailed.`;

  const promptLose = `A high-quality 3D render mobile game icon for "Apple of Fortune", showing an eaten apple core with exposed seeds and bitten pulp, centered inside a glowing dark-red metallic coin medallion with a bright hot-pink/crimson neon outer border, dark sleek UI background, mobile game defeat icon, 8k resolution, Unreal Engine 5 render style, dramatic lighting.`;

  const htmlSourceCode = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Apple of Fortune Icons</title>
<style>
  body {
    background-color: #120822;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 40px;
    margin: 0;
  }
  .token {
    width: 140px;
    height: 140px;
    position: relative;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /* Winning Apple Style */
  .win-token {
    background: radial-gradient(circle at 30% 30%, #2ecc71, #137e3b 70%, #084920);
    box-shadow: 0 0 20px #00ff66, inset 0 2px 4px rgba(255,255,255,0.4);
    border: 4px solid #00ff7f;
  }
  /* Losing Apple Style */
  .lose-token {
    background: radial-gradient(circle at 30% 30%, #a81c1c, #630808 70%, #300303);
    box-shadow: 0 0 20px #ff0055, inset 0 2px 4px rgba(255,255,255,0.3);
    border: 4px solid #ff2a6d;
  }
  .icon-img {
    width: 80px;
    height: 80px;
  }
</style>
</head>
<body>

  <!-- WINNING TOKEN: GREEN WITH WHOLE APPLE -->
  <div class="token win-token">
    <svg class="icon-img" viewBox="0 0 100 100">
      <path d="M50 25 C30 10 10 30 18 65 C22 82 35 95 50 90 C65 95 78 82 82 65 C90 30 70 10 50 25 Z" fill="#e61919"/>
      <path d="M30 30 C20 40 20 60 30 70" stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M50 25 Q52 10 60 6" stroke="#5c2c16" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M54 16 Q70 8 72 20 Q58 24 54 16 Z" fill="#44bd32"/>
    </svg>
  </div>

  <!-- LOSING TOKEN: RED WITH APPLE CORE -->
  <div class="token lose-token">
    <svg class="icon-img" viewBox="0 0 100 100">
      <path d="M30 32 C30 20 70 20 70 32 C65 37 35 37 30 32 Z" fill="#d63031"/>
      <path d="M50 24 Q52 12 58 8" stroke="#3e1b0c" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M32 78 C35 73 65 73 68 78 C65 88 35 88 32 78 Z" fill="#d63031"/>
      <path d="M36 33 Q46 55 42 75 L58 75 Q54 55 64 33 Z" fill="#ffeaa7"/>
      <ellipse cx="49" cy="54" rx="2" ry="4" fill="#2d3436" transform="rotate(-15 49 54)"/>
    </svg>
  </div>

</body>
</html>`;

  const copyPrompt = (text: string, index: number) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const copyHtmlCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(htmlSourceCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0c0818] border border-cyan-500/40 shadow-2xl p-5 sm:p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Apple of Fortune Classic Token Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  1xBet / Melbet Asset
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Winning Symbol (Green Token) &amp; Losing Symbol (Red Token) Vector Assets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Live Interactive Token Preview (140px Faithful Render) */}
        <div className="p-6 rounded-3xl bg-[#120822] border border-purple-500/30 shadow-inner flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-xs text-purple-300 font-mono font-bold tracking-wider uppercase">
            Live Vector Tokens Preview (140px Scale)
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 py-2">
            {/* Winning Token (Green) */}
            <div className="flex flex-col items-center gap-2.5">
              <div
                className="w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] rounded-full flex items-center justify-center transition-transform hover:scale-105 duration-200"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #2ecc71, #137e3b 70%, #084920)',
                  boxShadow: '0 0 22px #00ff66, inset 0 2px 4px rgba(255,255,255,0.4)',
                  border: '4px solid #00ff7f',
                }}
              >
                <svg className="w-[72px] h-[72px]" viewBox="0 0 100 100">
                  <path
                    d="M50 25 C30 10 10 30 18 65 C22 82 35 95 50 90 C65 95 78 82 82 65 C90 30 70 10 50 25 Z"
                    fill="#e61919"
                  />
                  <path
                    d="M30 30 C20 40 20 60 30 70"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M50 25 Q52 10 60 6" stroke="#5c2c16" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M54 16 Q70 8 72 20 Q58 24 54 16 Z" fill="#44bd32" />
                </svg>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Winning Symbol (Green)
              </span>
            </div>

            {/* Losing Token (Red) */}
            <div className="flex flex-col items-center gap-2.5">
              <div
                className="w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] rounded-full flex items-center justify-center transition-transform hover:scale-105 duration-200"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #a81c1c, #630808 70%, #300303)',
                  boxShadow: '0 0 22px #ff0055, inset 0 2px 4px rgba(255,255,255,0.3)',
                  border: '4px solid #ff2a6d',
                }}
              >
                <svg className="w-[72px] h-[72px]" viewBox="0 0 100 100">
                  <path d="M30 32 C30 20 70 20 70 32 C65 37 35 37 30 32 Z" fill="#d63031" />
                  <path d="M50 24 Q52 12 58 8" stroke="#3e1b0c" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M32 78 C35 73 65 73 68 78 C65 88 35 88 32 78 Z" fill="#d63031" />
                  <path d="M36 33 Q46 55 42 75 L58 75 Q54 55 64 33 Z" fill="#ffeaa7" />
                  <ellipse cx="49" cy="54" rx="2" ry="4" fill="#2d3436" transform="rotate(-15 49 54)" />
                </svg>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                Losing Symbol (Red)
              </span>
            </div>
          </div>

          {/* In-Game Theme Style Selector */}
          <div className="pt-2 w-full max-w-sm flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectTokenStyle('classic_vector');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tokenStyle === 'classic_vector'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-black font-black shadow-md'
                  : 'bg-black/50 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Palette size={13} />
              <span>Use Classic Vector</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectTokenStyle('realism_wood');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tokenStyle === 'realism_wood'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black shadow-md'
                  : 'bg-black/50 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Layers size={13} />
              <span>Use 3D Wood Realism</span>
            </button>
          </div>
        </div>

        {/* Section 2: High-Detail AI Generation Prompts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span>AI Generation Prompts (DALL-E 3, Midjourney, Stable Diffusion)</span>
            </h4>
            <span className="text-[11px] text-gray-400 font-mono">8K Casino UI</span>
          </div>

          {/* Prompt 1: Winning Apple */}
          <div className="p-3.5 rounded-2xl bg-[#09111e] border border-emerald-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">
                Asset 1: Winning Apple (Green Medallion)
              </span>
              <button
                type="button"
                onClick={() => copyPrompt(promptWin, 1)}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedPromptIndex === 1 ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedPromptIndex === 1 ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed font-mono bg-black/40 p-2.5 rounded-xl border border-gray-800 select-text">
              {promptWin}
            </p>
          </div>

          {/* Prompt 2: Eaten Apple Core */}
          <div className="p-3.5 rounded-2xl bg-[#190d18] border border-rose-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300">
                Asset 2: Eaten Apple Core (Red Medallion)
              </span>
              <button
                type="button"
                onClick={() => copyPrompt(promptLose, 2)}
                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedPromptIndex === 2 ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedPromptIndex === 2 ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed font-mono bg-black/40 p-2.5 rounded-xl border border-gray-800 select-text">
              {promptLose}
            </p>
          </div>
        </div>

        {/* Section 3: Standalone HTML / Vector Export */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-purple-900/50 text-xs">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-cyan-400" />
            <span className="text-gray-400 font-mono">
              public/assets/aistudio/ai_studio_code__3__c021c743.html
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyHtmlCode}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedHtml ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedHtml ? 'Copied HTML!' : 'Copy HTML & CSS'}</span>
            </button>

            <a
              href="/assets/aistudio/ai_studio_code__3__c021c743.html"
              download="apple_of_fortune_icons.html"
              onClick={() => sound.playClick()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-black font-black transition flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download .html</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
