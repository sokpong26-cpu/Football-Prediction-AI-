import React from 'react';

// Official Authentic SVG Bank Logos matching user images
export const KhqrLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 120 48"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="120" height="48" rx="10" fill="#E21A1A" />
    {/* K */}
    <path
      d="M18 12H23.5V23L31.5 12H38L29 23.5L38.5 36H32L23.5 24.5V36H18V12Z"
      fill="white"
    />
    {/* H */}
    <path
      d="M44 12H49.5V21.5H59V12H64.5V36H59V26.5H49.5V36H44V12Z"
      fill="white"
    />
    {/* Q */}
    <path
      d="M82 12C74 12 68.5 17 68.5 24C68.5 31 74 36 82 36C84.8 36 87.2 35.2 89.2 33.7L94 37H99.5L93.5 32.2C95.2 30 95.5 27 95.5 24C95.5 17 90 12 82 12ZM82 17C86.5 17 90 20 90 24C90 28 86.5 31 82 31C77.5 31 74 28 74 24C74 20 77.5 17 82 17Z"
      fill="white"
    />
    <rect x="79" y="21" width="6" height="6" rx="1" fill="#E21A1A" />
    {/* R */}
    <path
      d="M102 12H110.5C114.5 12 117.5 14.5 117.5 18.5C117.5 21.5 115.5 23.5 112.5 24.5L118 36H112L107 25H102V36H96.5V12H102ZM102 21H109.5C111.5 21 112.5 20 112.5 18.5C112.5 17 111.5 16 109.5 16H102V21Z"
      fill="white"
    />
  </svg>
);

export const AmkLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="16" fill="#8E1F58" />
    {/* Stylized A */}
    <path
      d="M26 62L16 62L22 30C23 27 25 25 28 25C31 25 33 27 34 30L40 62L31 62L29 52L24 52L26 62Z"
      fill="white"
    />
    <path d="M25 45L28 36L30 45H25Z" fill="#8E1F58" />
    {/* Stylized M (W-like arch) */}
    <path
      d="M38 50L43 41C45 38 48 38 50 41L55 49L61 41C63 38 66 38 68 41L73 50L68 56L64 49L59 56C57 58 54 58 52 56L47 49L43 56L38 50Z"
      fill="white"
    />
    {/* Stylized K */}
    <path
      d="M74 26H81V42L89 32H98L88 45L99 64H89L81 50V64H74V26Z"
      fill="white"
    />
    {/* Rice stalk (ស្រូវ) curve below */}
    <path
      d="M12 79C22 75 35 73 48 74C65 75 80 80 92 82C88 78 81 74 74 72C60 68 44 68 28 72L12 79Z"
      fill="white"
      opacity="0.95"
    />
    <circle cx="34" cy="71" r="2" fill="white" />
    <circle cx="42" cy="70" r="2.2" fill="white" />
    <circle cx="50" cy="70" r="2.4" fill="white" />
    <circle cx="58" cy="71" r="2.4" fill="white" />
    <circle cx="66" cy="73" r="2.2" fill="white" />
    <circle cx="74" cy="75" r="2" fill="white" />
    <circle cx="82" cy="78" r="1.8" fill="white" />
  </svg>
);

export const KbPrasacLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="16" fill="#FFCD00" />
    {/* KB Star / Dynamic Symbol in black */}
    <g transform="translate(18, 16) scale(0.68)">
      <path
        d="M48 4C49 20 50 35 50 48C45 42 35 34 24 28C22 26 19 28 20 31C25 38 35 46 44 51C33 52 20 54 8 55C6 55 5 58 7 59C19 63 32 63 43 60C36 67 27 75 18 81C16 83 18 86 21 85C30 81 40 73 47 64C47 75 48 86 49 96C49 98 52 98 53 96C55 83 55 68 54 55C62 61 72 70 82 78C84 80 87 77 85 75C78 68 67 60 58 54C69 52 80 50 92 48C94 48 94 45 92 44C81 41 68 41 57 44C63 37 72 30 81 23C83 21 81 18 78 19C70 23 60 31 53 40C52 28 50 16 49 4C49 2 47 2 48 4Z"
        fill="#111111"
      />
      {/* b loop */}
      <path
        d="M66 38C68 34 72 34 74 38C76 43 73 48 68 49C64 50 62 46 64 42L66 38Z"
        fill="#111111"
      />
    </g>
    {/* KB PRASAC text */}
    <text
      x="50"
      y="84"
      textAnchor="middle"
      fontSize="13"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="#111111"
      letterSpacing="0.5"
    >
      KB PRASAC
    </text>
  </svg>
);

export const PpcLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="16" fill="#005DAA" />
    {/* White geometric building / arrow chevron inside square */}
    <g transform="translate(30, 18) scale(0.95)">
      {/* Background white box */}
      <rect x="0" y="0" width="42" height="42" rx="4" fill="white" />
      {/* Blue cutout triangle / upward arrow */}
      <path
        d="M21 8L36 26H28V36H14V26H6L21 8Z"
        fill="#005DAA"
      />
    </g>
    {/* PPCBank Text */}
    <text
      x="50"
      y="82"
      textAnchor="middle"
      fontSize="16"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="white"
      letterSpacing="-0.2"
    >
      PPCBank
    </text>
  </svg>
);

export const AbaLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 100 48"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="48" rx="10" fill="#004D71" />
    <text
      x="50"
      y="31"
      textAnchor="middle"
      fontSize="20"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="white"
      letterSpacing="1"
    >
      ABA
    </text>
    <text
      x="50"
      y="42"
      textAnchor="middle"
      fontSize="7.5"
      fontWeight="800"
      fontFamily="sans-serif"
      fill="#00D2B4"
      letterSpacing="2"
    >
      'PAY'
    </text>
  </svg>
);

export const WingLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 100 48"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="48" rx="10" fill="#75B827" />
    <text
      x="50"
      y="32"
      textAnchor="middle"
      fontSize="20"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="#0B2341"
      letterSpacing="0.5"
    >
      Wing
    </text>
  </svg>
);

export const UsdtLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-7' }) => (
  <svg
    viewBox="0 0 100 48"
    className={`${className} rounded-lg shadow-sm shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="48" rx="10" fill="#26A17B" />
    <circle cx="30" cy="24" r="14" fill="white" />
    <path
      d="M30 14V34M24 18H36M22 22C22 25 25.5 27 30 27C34.5 27 38 25 38 22C38 19 34.5 17 30 17C25.5 17 22 19 22 22Z"
      stroke="#26A17B"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <text
      x="64"
      y="30"
      textAnchor="middle"
      fontSize="14"
      fontWeight="900"
      fontFamily="sans-serif"
      fill="white"
      letterSpacing="0.5"
    >
      USDT
    </text>
  </svg>
);

// 4 Primary banks requested: KHQR, AMK Bank, KB Prasac Bank, PPC Bank
export const FEATURED_BANKS = [
  { id: 'khqr', name: 'KHQR', subname: 'All Banks KHQR', badge: 'ពេញនិយម', LogoComponent: KhqrLogo, color: '#E21A1A' },
  { id: 'amk', name: 'AMK Bank', subname: 'ធនាគារ អេស អឹម ខេ', badge: 'ទូទាត់រហ័ស', LogoComponent: AmkLogo, color: '#8E1F58' },
  { id: 'prasac', name: 'KB Prasac Bank', subname: 'ធនាគារ ខេប៊ី ប្រាសាក់', badge: 'ស្វ័យប្រវត្តិ', LogoComponent: KbPrasacLogo, color: '#FFCD00' },
  { id: 'ppc', name: 'PPC Bank', subname: 'ធនាគារ ភ្នំពេញពាណិជ្ជ', badge: 'ភ្លាមៗ', LogoComponent: PpcLogo, color: '#005DAA' },
];

export const BankLogosBar: React.FC<{
  onSelectBank?: (bankId: string) => void;
  className?: string;
  showLabels?: boolean;
}> = ({ onSelectBank, className = '', showLabels = true }) => (
  <div className={`flex items-center gap-2 flex-wrap ${className}`}>
    {FEATURED_BANKS.map((b) => {
      const { LogoComponent } = b;
      return (
        <div
          key={b.id}
          onClick={() => onSelectBank && onSelectBank(b.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0c180f] border border-[#1b3420] shadow-sm hover:border-emerald-500/50 transition ${
            onSelectBank ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          }`}
          title={`${b.name} (${b.subname})`}
        >
          <LogoComponent className="w-6 h-4" />
          {showLabels && (
            <span className="text-[11px] font-bold text-gray-200 tracking-tight whitespace-nowrap">
              {b.name}
            </span>
          )}
        </div>
      );
    })}
  </div>
);
