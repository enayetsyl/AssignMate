// src/constant/index.ts
import { MenuItem } from '@/interface';

export const menuItems: MenuItem[] = [
  {
    title: 'Bangla',
    href: '/bangla',
    items: [
      
      { label: 'Single Word Puzzle', href: '/bangla/single-word-puzzle' },
      { label: 'Multi Word Puzzle Easy', href: '/bangla/multi-word-puzzle-easy' },
      { label: 'Multi Word Puzzle Medium', href: '/bangla/multi-word-puzzle-medium' },
      { label: 'Multi Word Puzzle Hard', href: '/bangla/multi-word-puzzle-hard' },
      { label: 'Multi Word Puzzle Stone', href: '/bangla/multi-word-puzzle-stone' },
      { label: 'Image CrossWord Puzzle Horizontal', href: '/bangla/image-horizontal-crossword-puzzle' },
      { label: 'Image CrossWord Puzzle Vertical', href: '/bangla/image-vertical-crossword-puzzle' },
      { label: 'Image CrossWord Puzzle Horizontal and Vertical', href: '/bangla/image-v-and-h-crossword-puzzle' },
      { label: 'Bangla Image CrossWord Puzzle Mixed', href: '/bangla/image-mixed-crossword-puzzle' },
      { label: 'Word Rearrange', href: '/bangla/word-rearrange' },
      
      { label: 'Placeholder 5', href: '/bangla/placeholder-5' },
    ],
  },
  {
    title: 'English',
    href: '/english',
    items: [
      { label: 'One Word Puzzle', href: '/english/single-word-puzzle' },
      { label: 'Multi Word Puzzle Easy', href: '/english/multi-word-puzzle-easy' },
      { label: 'Multi Word Puzzle Medium', href: '/english/multi-word-puzzle-medium' },
      { label: 'Multi Word Puzzle Hard', href: '/english/multi-word-puzzle-hard' },
      { label: 'Multi Word Puzzle Stone', href: '/english/multi-word-puzzle-stone' },
      { label: 'Word Rearrange', href: '/english/word-rearrange' },
      { label: 'Image CrossWord Puzzle Horizontal', href: '/english/image-horizontal-crossword-puzzle' },
      { label: 'Image CrossWord Puzzle Vertical', href: '/english/image-vertical-crossword-puzzle' },
      { label: 'Image CrossWord Puzzle Vertical & Horizontal', href: '/english/image-v-and-h-crossword-puzzle' },
      { label: 'Image CrossWord Puzzle Mixed', href: '/english/image-mixed-crossword-puzzle' },
      { label: 'Sentence Scramble', href: '/english/sentence-scramble' },
    ],
  },
  {
    title: 'Math',
    href: '/math',
    items: [
      { label: 'Math Triangle', href: '/math/math-triangle' },
      { label: 'Image Count Horizontal', href: '/math/image-count' },
      { label: 'Image Count Vertical', href: '/math/image-count-vertical' },
      { label: 'Left Right', href: '/math/left-right' },
      { label: 'Fingerprint Math Addition', href: '/math/fingerprint-math' },
      { label: 'Placeholder 4', href: '/math/placeholder-4' },
      { label: 'Placeholder 5', href: '/math/placeholder-5' },
    ],
  },
  {
    title: 'Science',
    href: '/science',
    items: [
      { label: 'Simple Maze', href: '/science/simple-maze' },
      { label: 'Middle Maze', href: '/science/middle-maze' },
      { label: 'Circular Maze', href: '/science/circular-maze' },
      { label: 'Quiz', href: '/science/quiz' },
      { label: 'Placeholder 4', href: '/science/placeholder-4' },
      { label: 'Placeholder 5', href: '/science/placeholder-5' },
    ],
  },
  {
    title: 'BGS',
    href: '/bgs',
    items: [
      { label: 'Placeholder 1', href: '/bgs/placeholder-1' },
      { label: 'Placeholder 2', href: '/bgs/placeholder-2' },
      { label: 'Placeholder 3', href: '/bgs/placeholder-3' },
      { label: 'Placeholder 4', href: '/bgs/placeholder-4' },
      { label: 'Placeholder 5', href: '/bgs/placeholder-5' },
    ],
  },
  {
    title: 'Deen',
    href: '/deen',
    items: [
      { label: 'Placeholder 1', href: '/deen/placeholder-1' },
      { label: 'Placeholder 2', href: '/deen/placeholder-2' },
      { label: 'Placeholder 3', href: '/deen/placeholder-3' },
      { label: 'Placeholder 4', href: '/deen/placeholder-4' },
      { label: 'Placeholder 5', href: '/deen/placeholder-5' },
    ],
  },
  {
    title: 'Other',
    href: '/other',
    items: [
      { label: 'Riddle', href: '/other/riddle' },
      { label: 'Flag Quiz', href: '/other/flag-quiz' },
      { label: 'Image Difference', href: '/other/image-difference' },
      { label: 'Matching Image', href: '/other/matching-image' },
      { label: 'Shadow Image Matching', href: '/other/shadow-image-matching' },
      { label: 'Dot Image', href: '/other/dot-image' },
      { label: 'Placeholder 4', href: '/other/placeholder-4' },
      { label: 'Placeholder 5', href: '/other/placeholder-5' },
    ],
  },
];


export const dummyWords = [
  'a', 'able', 'about', 'above', 'add', 'after', 'again', 'air', 'all', 'always',
  'am', 'an', 'and', 'any', 'are', 'around', 'as', 'ask', 'at', 'away',

  'baby', 'back', 'bad', 'bag', 'ball', 'banana', 'band', 'bank', 'base', 'bat',
  'be', 'bear', 'beat', 'beautiful', 'bed', 'bee', 'bell', 'best', 'big', 'bird',

  'call', 'can', 'cap', 'car', 'card', 'care', 'carry', 'cat', 'catch', 'chair',
  'change', 'chat', 'check', 'cheese', 'cherry', 'chicken', 'chin', 'chop', 'circle', 'class',

  'dad', 'dance', 'dark', 'day', 'deep', 'desk', 'did', 'dig', 'do', 'dog',
  'doll', 'done', 'door', 'down', 'draw', 'dress', 'drink', 'drop', 'duck', 'dust',

  'ear', 'eat', 'egg', 'eight', 'end', 'even', 'every', 'example', 'eye', 'earth',
  'echo', 'edge', 'easy', 'else', 'enjoy', 'enter', 'extra', 'excite', 'exit', 'event',

  'face', 'fact', 'fall', 'far', 'fast', 'fat', 'feed', 'feel', 'few', 'fill',
  'find', 'fine', 'finger', 'finish', 'fire', 'first', 'fish', 'five', 'fly', 'follow',

  'game', 'gave', 'get', 'gift', 'girl', 'give', 'glad', 'go', 'goat', 'gold',
  'good', 'got', 'green', 'grew', 'guess', 'gum', 'gym', 'grape', 'gear', 'gentle',

  'had', 'hair', 'half', 'hand', 'hang', 'hard', 'has', 'have', 'he', 'head',
  'hear', 'help', 'her', 'here', 'high', 'him', 'his', 'hold', 'home', 'hope',

  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'idea', 'ice', 'inch',
  'item', 'ivory', 'identical', 'improve', 'invite', 'issue', 'interest', 'inside', 'image', 'icon',

  'jam', 'jet', 'job', 'joy', 'jump', 'just', 'joke', 'judge', 'join', 'journey',
  'jolly', 'juice', 'junior', 'jigsaw', 'journal', 'jeep', 'jack', 'jetty', 'jubilee', 'jewel',

  'keep', 'kind', 'king', 'know', 'kite', 'kick', 'kiss', 'kitchen', 'kitten', 'knock',
  'keen', 'kiln', 'kitty', 'knot', 'knockout', 'kayak', 'kettle', 'key', 'kid', 'kingdom',

  'laugh', 'lad', 'lake', 'land', 'large', 'last', 'late', 'leaf', 'learn', 'least',
  'leave', 'left', 'leg', 'letter', 'level', 'life', 'light', 'like', 'line', 'list',

  'made', 'make', 'many', 'map', 'mark', 'may', 'me', 'mean', 'meat', 'meet',
  'member', 'milk', 'mind', 'mine', 'minute', 'miss', 'mix', 'model', 'moment', 'money',

  'name', 'near', 'need', 'never', 'new', 'next', 'nice', 'night', 'no', 'not',
  'now', 'number', 'note', 'nurse', 'nap', 'nature', 'narrow', 'nest', 'net', 'noble',

  'of', 'off', 'oil', 'old', 'on', 'once', 'one', 'only', 'open', 'or',
  'our', 'out', 'over', 'own', 'offer', 'oak', 'ocean', 'object', 'orange', 'oven',

  'page', 'paint', 'pair', 'paper', 'part', 'park', 'party', 'pass', 'past', 'pay',
  'pen', 'pencil', 'people', 'pet', 'pick', 'picture', 'piece', 'pig', 'pin', 'place',

  'queen', 'question', 'quick', 'quiet', 'quilt', 'quote', 'quiz', 'quack', 'quality', 'quarter',
  'quake', 'query', 'quiver', 'quill', 'quirky', 'quantum', 'quench', 'quest', 'quotation', 'quizzer',

  'rain', 'raise', 'ran', 'range', 'rapid', 'read', 'ready', 'real', 'red', 'ride',
  'ring', 'rip', 'road', 'rock', 'roll', 'room', 'root', 'round', 'run', 'rush',

  'sail', 'salt', 'same', 'sand', 'say', 'sea', 'seat', 'second', 'see', 'seed',
  'seem', 'sell', 'send', 'sense', 'set', 'seven', 'shake', 'shape', 'share', 'she',

  'table', 'take', 'talk', 'tall', 'ten', 'term', 'test', 'than', 'thank', 'that',
  'the', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think', 'this',

  'under', 'unit', 'upon', 'up', 'use', 'useful', 'usual', 'unicorn', 'unique', 'upset',
  'urban', 'urge', 'user', 'uncle', 'unison', 'until', 'unload', 'untie', 'uncover', 'upstairs',

  'value', 'van', 'vary', 'vase', 'vast', 'verb', 'very', 'view', 'village', 'visit',
  'voice', 'void', 'vote', 'volume', 'vow', 'vendor', 'vertical', 'vibrant', 'vice', 'victory',

  'wait', 'walk', 'want', 'warm', 'wash', 'watch', 'water', 'way', 'we', 'weak',
  'wear', 'week', 'well', 'went', 'were', 'west', 'what', 'when', 'where', 'which',

  'xray', 'xylophone', 'xeno', 'xenon', 'x-axis', 'xylem', 'xerox', 'xiphoid', 'xylan', 'xylitol',
  'xenial', 'xerosis', 'xenia', 'xanthic', 'xanthous', 'xebec', 'xylocarp', 'xenomorph', 'xystus', 'xanthene',

  'yard', 'yarn', 'year', 'yellow', 'yes', 'yet', 'yodel', 'young', 'youth', 'yummy',

  'zebra', 'zero', 'zigzag', 'zip', 'zoom', 'zone', 'zest', 'zephyr', 'zinc', 'zodiac'
];