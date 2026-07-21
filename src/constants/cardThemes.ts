import bg1 from '../assets/images/cardBackground1.svg';
import bg2 from '../assets/images/cardBackground2.svg';
import bg3 from '../assets/images/cardBackground3.svg';
import bg4 from '../assets/images/cardBackground4.svg';
import bg5 from '../assets/images/cardBackground5.svg';
import bg6 from '../assets/images/cardBackground6.svg';
import bg7 from '../assets/images/cardBackground7.svg';
import bg8 from '../assets/images/cardBackground8.svg';
import bg9 from '../assets/images/cardBackground9.svg';
import bg10 from '../assets/images/cardBackground10.svg';
import bg11 from '../assets/images/cardBackground11.svg';
import bg12 from '../assets/images/cardBackground12.svg';
import bg13 from '../assets/images/cardBackground13.svg';
import bg14 from '../assets/images/cardBackground14.svg';

export interface CardThemeItem {
  id: string;
  name: string;
  image: string;
}

export const CARD_THEMES: CardThemeItem[] = [
  { id: 'theme1', name: 'Theme 1', image: bg1 },
  { id: 'theme2', name: 'Theme 2', image: bg2 },
  { id: 'theme3', name: 'Theme 3', image: bg3 },
  { id: 'theme4', name: 'Theme 4', image: bg4 },
  { id: 'theme5', name: 'Theme 5', image: bg5 },
  { id: 'theme6', name: 'Theme 6', image: bg6 },
  { id: 'theme7', name: 'Theme 7', image: bg7 },
  { id: 'theme8', name: 'Theme 8', image: bg8 },
  { id: 'theme9', name: 'Theme 9', image: bg9 },
  { id: 'theme10', name: 'Theme 10', image: bg10 },
  { id: 'theme11', name: 'Theme 11', image: bg11 },
  { id: 'theme12', name: 'Theme 12', image: bg12 },
  { id: 'theme13', name: 'Theme 13', image: bg13 },
  { id: 'theme14', name: 'Theme 14', image: bg14 },
];
