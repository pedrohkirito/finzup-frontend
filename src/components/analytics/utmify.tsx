import Script from 'next/script';

export function Utmify() {
  return (
    <Script
      id="utmify"
      src="https://cdn.utmify.com.br/scripts/utms/latest.js"
      strategy="afterInteractive"
      data-utmify-prevent-xcod-sck=""
      data-utmify-prevent-subids=""
    />
  );
}
