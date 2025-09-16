import * as en from '../i18n/en.json';
import * as fr from '../i18n/fr.json';
import * as zh from '../i18n/zh.json';
i18next.addResourceBundle('en', 'extended-graph', en);
i18next.addResourceBundle('fr', 'extended-graph', fr);
i18next.addResourceBundle('zh', 'extended-graph', zh);
export const t = i18next.getFixedT(null, "extended-graph");
export const tObsidian = i18next.getFixedT(null, "default");