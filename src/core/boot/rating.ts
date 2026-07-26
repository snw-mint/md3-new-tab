import { showSnackbar } from '../ui/snackbar';
import { t } from '../shared/i18n';

export function initRatingSystem(): void {
  const RATING_KEY = 'ent_rating_install_date';
  const RATING_DISMISSED = 'ent_rating_dismissed';
  const RATING_LAST_SHOWN = 'ent_rating_last_shown';

  if (localStorage.getItem(RATING_DISMISSED)) return;

  let installDateStr = localStorage.getItem(RATING_KEY);
  if (!installDateStr) {
    installDateStr = new Date().toISOString();
    localStorage.setItem(RATING_KEY, installDateStr);
    return;
  }

  const installDate = new Date(installDateStr);
  const now = new Date();
  const diffDays = (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays >= 7) {
    const lastShownStr = localStorage.getItem(RATING_LAST_SHOWN);
    if (lastShownStr) {
      const lastShown = new Date(lastShownStr);
      const hoursSinceLastShown = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastShown < 24) {
        return;
      }
    }

    setTimeout(() => {
      showSnackbar({
        text: t('rateUsSnackbarMessage'),
        actionText: t('rateUsSnackbarAction'),
        duration: 15000,
        onAction: () => {
          window.open('##STORE_LINK##', '_blank');
          localStorage.setItem(RATING_DISMISSED, 'true');
        }
      });
      localStorage.setItem(RATING_LAST_SHOWN, new Date().toISOString());
    }, 2000);
  }
}
