// src/constant/index.ts
import { MenuItem } from '@/interface';

export const menuItems: MenuItem[] = [
  {
    title: 'Bangla',
    href: '/bangla',
    items: [
      { label: 'Bangla Image CrossWord Puzzle Mixed', href: '/bangla/bangla-image-mixed-crossword-puzzle' },
      { label: 'Single Word Puzzle', href: '/bangla/single-word-puzzle' },
      { label: 'Placeholder 3', href: '/bangla/placeholder-3' },
      { label: 'Placeholder 4', href: '/bangla/placeholder-4' },
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
      { label: 'Placeholder 3', href: '/science/placeholder-3' },
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
];
