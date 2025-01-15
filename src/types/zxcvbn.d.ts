declare module 'zxcvbn' {
  interface ZXCVBNResult {
    score: number;
    feedback: {
      suggestions: string[];
    };
    guesses: number;
    guesses_log10: number;
  }

  function zxcvbn(password: string): ZXCVBNResult;
  export = zxcvbn;
}