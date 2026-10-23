import './globals.css';

export const metadata = {
  title: 'POP:ZERO | Ultra-Clean Zero Sugar Refreshment',
  description: 'Experience POP:ZERO — crisp botanicals, zero sugar, and micro-carbonated refreshment. Pure fizz redefined.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@400;500&family=Manrope:wght@400;700&family=Galada&display=swap"
          rel="stylesheet"
        />
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" async></script>
      </head>
      <body>
        {children}
        <svg style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
          <filter id="frosted">
            <feTurbulence type="fractalNoise" baseFrequency="0.0125" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      </body>
    </html>
  );
}
