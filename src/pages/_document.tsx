import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" suppressHydrationWarning>
        <Head>
          {/* Meta tags */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Performance optimizations */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* DNS prefetch for external domains */}
          <link rel="dns-prefetch" href="https://cdn.stamp.fyi" />
          <link rel="dns-prefetch" href="https://devnet.irys.xyz" />
          <link rel="dns-prefetch" href="https://belpy-core.blockifyy.com" />
        </Head>
        <body suppressHydrationWarning>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
