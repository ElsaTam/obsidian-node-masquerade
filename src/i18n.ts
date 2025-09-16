import * as en from '../i18n/en.json';
import * as fr from '../i18n/fr.json';
import * as zh from '../i18n/zh.json';
i18next.addResourceBundle('en', 'node-masquerade', en);
i18next.addResourceBundle('fr', 'node-masquerade', fr);
i18next.addResourceBundle('zh', 'node-masquerade', zh);
export const t = i18next.getFixedT(null, "node-masquerade");
export const tObsidian = i18next.getFixedT(null, "default");