import { useI18nStore } from '@/lib/i18n/store';
import { ar } from '@/lib/i18n/ar';
import { fr } from '@/lib/i18n/fr';

const dictionaries = {
  ar,
  fr,
};

export function useTranslation() {
  const language = useI18nStore((state) => state.language);
  const t = dictionaries[language];

  return { t, language };
}
