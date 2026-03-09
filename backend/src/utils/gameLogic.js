import constants from '../config/constants.js';
import  wordList from './wordList.js';

const  { MAX_SCORE_GUESSER, MIN_SCORE_GUESSER, DRAWER_SCORE_PER_GUESSER, DEFAULT_DRAW_TIME } = constants;


 // Calculate guesser score based on time remaining
 // Faster guesses = more points
 
const calcGuesserScore = (timeLeft, drawTime = DEFAULT_DRAW_TIME) => {
  const fraction = timeLeft / drawTime;
  return Math.round(MIN_SCORE_GUESSER + (MAX_SCORE_GUESSER - MIN_SCORE_GUESSER) * fraction);
};


// Pick N random unique words from word bank + optional custom words
 
const pickWords = (n = 3, customWords = [], useCustomOnly = false) => {
  const pool = useCustomOnly && customWords.length >= n
    ? customWords
    : [...wordList, ...customWords];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// 
// Build hint string from word.
//  e.g. "apple" → "_ _ _ _ _" then reveal some letters over time.
//  @param {string} word
//  @param {number} revealed - how many letters to reveal (0 = all blanks)
//  
const buildHint = (word, revealed = 0) => {
  const letters = [...word];
  // Always reveal spaces immediately
  const indicesToReveal = new Set();
  letters.forEach((ch, i) => { if (ch === ' ') indicesToReveal.add(i); });

  // Pick additional random indices to reveal not yet revealed
  const hiddenIndices = letters
    .map((ch, i) => ch !== ' ' ? i : -1)
    .filter(i => i !== -1 && !indicesToReveal.has(i));

  const shuffledHidden = [...hiddenIndices].sort(() => Math.random() - 0.5);
  shuffledHidden.slice(0, revealed).forEach(i => indicesToReveal.add(i));

  return letters.map((ch, i) => indicesToReveal.has(i) ? ch : '_').join(' ');
};


// How many letters to reveal at given time fractions

const getHintRevealCount = (word, elapsed, drawTime) => {
  const fraction = elapsed / drawTime;
  const wordLen = word.replace(/ /g, '').length;
  if (fraction >= 0.7) return Math.floor(wordLen * 0.4);
  if (fraction >= 0.4) return Math.floor(wordLen * 0.2);
  return 0;
};

// Rank players by score (descending), assign rank field
const rankPlayers = (players) => {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));
};


//  Check if a guess is correct (case-insensitive, trimmed)
 
const isCorrectGuess = (guess, word) =>
  guess.trim().toLowerCase() === word.trim().toLowerCase();

export {
  calcGuesserScore,
  pickWords,
  buildHint,
  getHintRevealCount,
  rankPlayers,
  isCorrectGuess,
  DRAWER_SCORE_PER_GUESSER,
};
