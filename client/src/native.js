// Native bridge (Capacitor). All imports are lazy so the web/PWA bundle
// never breaks when native plugins are absent. No-ops in the browser.
export async function setupNative(getPath, goBack) {
  try {
    const [{ App }, { StatusBar, Style }] = await Promise.all([
      import('@capacitor/app'),
      import('@capacitor/status-bar')
    ]);
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0B192C' });
    } catch { /* older webviews */ }
    App.addListener('backButton', ({ canGoBack }) => {
      const path = getPath();
      if (path === '/' || path === '/welcome') {
        App.exitApp();
      } else if (canGoBack) {
        goBack();
      } else {
        App.exitApp();
      }
    });
  } catch {
    /* running as pure web — nothing to wire */
  }
}
