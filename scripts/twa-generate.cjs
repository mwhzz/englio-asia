// Generates the Android (TWA) project in android/ from the live web manifest, without Bubblewrap's prompts.
// usage (Git Bash): npm i --no-save @bubblewrap/core@1.27.0 && node scripts/twa-generate.cjs <domain> android <path to englio-upload.jks> <versionCode> <versionName>
// Run it again only when the domain, name or icons change; then bump appVersionCode and run android/build.sh.
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');
// versionCode must go up by one for every Play Store upload; versionName is what people see.
const [, , domain, outDir, keyPath, versionCode = '1', versionName = '1.0.0'] = process.argv;
(async () => {
  const url = new URL(`https://${domain}/manifest.webmanifest`);
  const json = await (await fetch(url)).json();
  const m = TwaManifest.fromWebManifestJson(url, json);
  m.packageId = 'app.englio.twa';
  m.name = 'Englio — Learn English';
  m.launcherName = 'Englio';
  m.enableNotifications = true;          // reminders show as the app's notifications (Android 13+ asks permission)
  m.signingKey = { path: keyPath, alias: 'englio' };
  m.minSdkVersion = 24;                  // androidbrowserhelper needs Android 7+
  m.appVersionCode = Number(versionCode);
  m.appVersionName = versionName;
  m.fallbackType = 'customtabs';
  m.iconUrl = `https://${domain}/icon-512.png`;
  m.monochromeIconUrl = `https://${domain}/icon-badge-96.png`;   // status-bar icon for notifications
  const err = m.validate();
  if (err) throw new Error(err);
  await new TwaGenerator().createTwaProject(outDir, m, new ConsoleLog('gen'));
  await m.saveToFile(`${outDir}/twa-manifest.json`);
  console.log('Generated', outDir, 'host', m.host, 'start', m.startUrl, 'icon', m.iconUrl, 'maskable', m.maskableIconUrl);
})().catch((e) => { console.error(e); process.exit(1); });
