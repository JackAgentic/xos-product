import {
  Home as HomeIcon,
  PiggyBank,
  Shield,
  TrendingUp,
  Landmark,
} from 'lucide-react';

export const adviceLabels: { [key: string]: string } = {
  M: 'Mortgage',
  K: 'KiwiSaver',
  I: 'Insurance',
  V: 'Investment',
  R: 'Retirement'
};

export const getAdviceIcon = (letter: string) => {
  const iconProps = { className: "w-4 h-4" };
  switch (letter) {
    case 'M':
      return <HomeIcon {...iconProps} />;
    case 'K':
      return <PiggyBank {...iconProps} />;
    case 'I':
      return <Shield {...iconProps} />;
    case 'V':
      return <TrendingUp {...iconProps} />;
    case 'R':
      return <Landmark {...iconProps} />;
    default:
      return letter;
  }
};
