import Document, { DocumentContext } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  /* 
    This logic is required to make styled components work nicely with nextjs's ssr features

    For the reference implementation, see https://github.com/vercel/next.js/blob/canary/examples/with-styled-components/pages/_document.tsx
  */
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({ enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />) });

      const initialProps = await Document.getInitialProps(ctx);
      return { ...initialProps, styles: [initialProps.styles, sheet.getStyleElement()] };
    } finally {
      sheet.seal();
    }
  }
}
