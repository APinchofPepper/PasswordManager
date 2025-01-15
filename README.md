# Password Strength Manager

## Project Overview
A comprehensive Vue.js password management application with robust security features.

## Features
- Real-time password strength analysis
- Strong password generation
- Encrypted local password storage
- Secure retrieval of stored passwords

## Security Considerations
⚠️ IMPORTANT SECURITY NOTES:
1. Always use a strong, unique encryption key
2. Never store the encryption key in version control
3. Use environment variables for sensitive configurations

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation Steps
1. Clone the repository
```bash
git clone https://github.com/APinchofPepper/password-strength-manager.git
cd password-strength-manager
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the project root
```
VITE_ENCRYPTION_SECRET=your_very_long_and_complex_secret_key
```

4. Start the development server
```bash
npm run dev
```

## Security Best Practices
- Regularly update dependencies
- Use a password manager for your encryption key
- Implement additional authentication for access
- Consider using secure hardware storage for critical passwords

## Technology Stack
- Vue 3
- TypeScript
- Tailwind CSS
- zxcvbn (Strength Estimation)
- CryptoJS (Encryption)

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.