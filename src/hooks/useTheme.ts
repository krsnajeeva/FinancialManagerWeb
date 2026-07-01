import {useAppSelector} from '../redux/hooks';
import {THEMES, AppTheme} from '../constants/theme';

export const useTheme = (): AppTheme => {
  const activeThemeId = useAppSelector(state => state.settings.activeThemeId) || 'theme1';
  return THEMES[activeThemeId] || THEMES.theme1;
};
