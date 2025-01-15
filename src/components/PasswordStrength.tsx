import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const calculateStrength = (pwd: string) => {
    let score = 0;
    
    // Length check
    if (pwd.length >= 12) score += 2;
    else if (pwd.length >= 8) score += 1;

    // Complexity checks
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecial) score += 1;

    return score;
  };

  const strength = calculateStrength(password);

  const getStrengthLabel = () => {
    switch (true) {
      case strength <= 2: 
        return { 
          text: 'Weak', 
          color: 'text-red-500', 
          Icon: ShieldOff 
        };
      case strength <= 4: 
        return { 
          text: 'Moderate', 
          color: 'text-yellow-500', 
          Icon: ShieldAlert 
        };
      default: 
        return { 
          text: 'Strong', 
          color: 'text-green-500', 
          Icon: ShieldCheck 
        };
    }
  };

  const { text, color, Icon } = getStrengthLabel();

  return (
    <div className="flex items-center space-x-2 mt-2">
      <Icon className={`w-6 h-6 ${color}`} />
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${
            strength <= 2 ? 'bg-red-500 w-1/3' :
            strength <= 4 ? 'bg-yellow-500 w-2/3' :
            'bg-green-500 w-full'
          }`}
        ></div>
      </div>
      <span className={`text-sm font-medium ${color}`}>{text}</span>
    </div>
  );
};

export default PasswordStrength;