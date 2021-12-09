// This is an array containing all of your current letters
// You will be using this array for the tasks below
export let YOUR_LETTERS = []

export function generateLetterTiles(quantity = 8) {
  const bag = 'aaaabbccddeeeeeeffghhiiiijkllmmnnnooopppqrrrssstttuuvwxyyz'
  /**
   * @todo ================TASK================
   * The 'bag' variable contains a string of random letters.
   * The 'quantity' parameter tells us how many random letters we need to fetch from the bag
   * (Example: If quantity is 4, get 4 random letters from the bag)
   * If no number is passed, choose 8 letters
   * Push the random letters to the YOUR_LETTERS array
   * */
  let separatedBag = bag.split('')
  for (let i = 0; i < quantity; i++) {
    let pos = Math.floor(Math.random() * separatedBag.length)
    YOUR_LETTERS.push(separatedBag[pos])
    separatedBag.splice(pos, 1)
  }
}

export function getWordFromPlayer() {
  /**
   * @todo ================TASK================
   * Ask the player for a word using window.prompt()
   * If the player submits an empty string, keep on asking them for a word until they don't submit an empty string
   * otherwise, convert their word to lowercase, and return it
   * */
  while (true) {
    const word = window.prompt('Submit a word: ')
    if (word) {
      return word.toLowerCase()
    }
  }
}

export function removePlayedLetters(playedWord) {
  /**
   * @todo ================TASK================
   * The 'playedWord' parameter is the word the player submitted
   * We need to remove any of the letters in 'playedWord' from YOUR_LETTERS array
   * Iterate through every character in playedWord
   * If that character exists in YOUR_LETTERS, remove it from the array.
   * */
  for (let i = 0; i < playedWord.length; i++) {
    if (YOUR_LETTERS.includes(playedWord[i])) {
      YOUR_LETTERS.splice(YOUR_LETTERS.indexOf(playedWord[i]), 1)
    }
  }
}

export function isValidGuess(attemptedWord) {
  /**
   * @todo ================TASK================
   * We need to check whether the hand that the player played is valid
   * Check that every letter in 'attemptedWord' exists in YOUR_LETTERS
   * If it is, return true
   * If not, return false
   * */

  const remainingWords = YOUR_LETTERS.slice()
  for (let i = 0; i < attemptedWord.length; i++) {
    if (remainingWords.includes(attemptedWord[i])) {
      remainingWords.splice(remainingWords.indexOf(attemptedWord[i]), 1)
    } else {
      return false
    }
  }
  return true
}

export function isWordInDictionary(attemptedWord) {
  /**
   * @todo ================TASK================
   * Check that 'attemptedWord' exists in the dictionary
   * Hint: use the 'dictionary.find' method
   * */
  return dictionary.includes(attemptedWord)
}

/* #############################################################################

                               🧩 MiniScrabble
                            ---------------------
                         Do not edit below this line

############################################################################# */

const TOTAL_ROUNDS = 8
const HAND_SIZE = 8
import data from './data.js'
export const dictionary = data.dictionary
let points = 0 // Your current points
let round = 1 // Your current round

// For each round:
function startRound() {
  console.log(`Round ${round}/${TOTAL_ROUNDS}. "${YOUR_LETTERS.join(' ')}"`)

  // Ask the player for a word
  const yourWord = getWordFromPlayer()
  if (!yourWord) return console.log('No word provided')

  // Check they have the correct letters
  if (!isValidGuess(yourWord)) {
    console.log('You cannot make that word')
    return startRound()
  }

  // Check it's in the dictionary
  if (!isWordInDictionary(yourWord)) {
    console.log('Not found in dictionary')
    return startRound()

    // If so, give them some points and new letters
  } else {
    console.log(`+${yourWord.length} points! Getting new letters:`)
    removePlayedLetters(yourWord)
    generateLetterTiles(yourWord.length)
    points += yourWord.length

    // And then either move onto the next round
    if (round < TOTAL_ROUNDS) {
      round++
      return startRound()

      // or end the game after the final round
    } else {
      console.log(`End! Your final score is ${points}`)
    }
  }
}

// Start the game
function play() {
  console.log(
    `🧩 MiniScrabble: Get as many points as you can in ${TOTAL_ROUNDS} rounds`
  )
  const confirmPlay = window.prompt('Play now (y/n)')
  if (['y', 'yes'].includes(confirmPlay.toLowerCase())) {
    generateLetterTiles(HAND_SIZE)
    startRound()
  }
}
if (import.meta.main) play()
