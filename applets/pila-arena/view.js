// Standalone page: header/footer chrome plus the mountable applet.
import { setupPage } from '../../lib/page.js';
import '../../lib/registry.js'; // registers titles
import { mount, meta } from './applet.js';

setupPage({ slug: meta.slug, titleKey: meta.titleKey, legacyPath: meta.legacyPath, bare: true });
mount(document.getElementById('app'), { root: '../..' });
