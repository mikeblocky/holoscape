export type PresetHint =
  | {
      type: 'text';
      message: string;
    }
  | {
      type: 'palette';
      message: string;
      palette: [string, string, string, string];
    };

export type PresetUserRecord = {
  username: string;
  password: string;
  data: {
    theme?: string;
    themeColor?: string;
    displayName: string;
  };
  hints: PresetHint[];
  asset?: string;
};

const BASE_STRIPES: [string, string, string, string] = ['#c8d3ee', '#f7a2b0', '#b88369', '#b4eba0'];

const RAW_PRESET_USERS: PresetUserRecord[] = [
  {
    username: 'holoville',
    password: 'brooklyn',
    data: { theme: 'dark', displayName: 'Holovillian' },
    hints: [
      { type: 'text', message: 'Your key lives across the East River in NYC’s most populated borough.' },
      {
        type: 'palette',
        message: 'Subway stripes shuffled; think pink-first like the B train.',
        palette: ['#f7a2b0', '#c8d3ee', '#b88369', '#b4eba0']
      },
      { type: 'text', message: 'Brownstone blocks and warehouse piers whisper the password you seek.' },
      {
        type: 'palette',
        message: 'Bridge lights glow brown before the neon blue—follow that order.',
        palette: ['#b88369', '#f7a2b0', '#c8d3ee', '#b4eba0']
      }
    ],
    asset: '/media/universal.png'
  },
  {
    username: 'guy',
    password: 'santaisawesome',
    data: { themeColor: '#f6a0a3', displayName: 'Guy' },
    hints: [
      { type: 'text', message: 'Channel your inner elf gushing about Santa.' },
      {
        type: 'palette',
        message: 'Candy cane cue unlocked – pink now leads, green follows.',
        palette: ['#f7a2b0', '#b4eba0', '#c8d3ee', '#b88369']
      },
      { type: 'text', message: 'Pretend you are writing a note to the North Pole bragging about how awesome Santa is.' },
      {
        type: 'palette',
        message: 'North Pole confetti: green starter, brown cookie crumbs, then blue sky, pink bow.',
        palette: ['#b4eba0', '#b88369', '#c8d3ee', '#f7a2b0']
      }
    ],
    asset: '/media/guy.png'
  },
  {
    username: 'joey',
    password: 'soccer',
    data: { themeColor: '#aadf9b', displayName: 'Joey' },
    hints: [
      { type: 'text', message: 'Eleven players chase this ball without touching it with their hands.' },
      {
        type: 'palette',
        message: 'Pitch pattern engaged – green stripes wrap around the rest.',
        palette: ['#b4eba0', '#c8d3ee', '#f7a2b0', '#b88369']
      },
      { type: 'text', message: 'Think of cleats carving grass while chanting the world’s favorite sport.' },
      {
        type: 'palette',
        message: 'Stadium seats flip to blue-pink while the field stays ahead in green.',
        palette: ['#b4eba0', '#f7a2b0', '#c8d3ee', '#b88369']
      }
    ],
    asset: '/media/joey.png'
  },
  {
    username: 'larry',
    password: 'parttimeteacher',
    data: { themeColor: '#c7d7ee', displayName: 'Larry' },
    hints: [
      { type: 'text', message: 'Imagine a tutor who only clocks in for limited shifts.' },
      {
        type: 'palette',
        message: 'Class schedule stripes put blue back at the chalkboard first.',
        palette: ['#c8d3ee', '#b88369', '#b4eba0', '#f7a2b0']
      },
      { type: 'text', message: 'Office hours only run part of the time—mirror that phrasing.' },
      {
        type: 'palette',
        message: 'Faculty lounge palette: chalk blue, mint handout, candy pink, desert bookmark.',
        palette: ['#c8d3ee', '#b4eba0', '#f7a2b0', '#b88369']
      }
    ],
    asset: '/media/larry.png'
  },
  {
    username: 'gary',
    password: 'joey',
    data: { themeColor: '#bd8d79', displayName: 'Gary' },
    hints: [
      { type: 'text', message: 'Borrow the name of your younger friend to unlock Gary.' },
      {
        type: 'palette',
        message: 'Bestie stripes activated – brown steps up first to shout Joey.',
        palette: ['#b88369', '#c8d3ee', '#f7a2b0', '#b4eba0']
      },
      { type: 'text', message: 'He literally typed his buddy’s nickname as the secret—no caps, no twists.' },
      {
        type: 'palette',
        message: 'Friendship rings: pink ribbon between brown and blue, green cheering last.',
        palette: ['#b88369', '#f7a2b0', '#c8d3ee', '#b4eba0']
      }
    ],
    asset: '/media/gary.png'
  },
  {
    username: 'SOMETHINGINTERNAL',
    password: 'threefortyone',
    data: { theme: 'secret', displayName: 'Internal User' },
    hints: [
      { type: 'text', message: 'Spell the digits on the clock when it reads 3:41 a.m.' },
      {
        type: 'palette',
        message: 'System stripes now follow internal order – brown, pink, blue, green.',
        palette: ['#b88369', '#f7a2b0', '#c8d3ee', '#b4eba0']
      },
      { type: 'text', message: 'Write the time as a single word, no numerals, exactly how the announcer says it.' },
      {
        type: 'palette',
        message: 'Server racks glow pink before blue; green idle lights stay last.',
        palette: ['#f7a2b0', '#c8d3ee', '#b88369', '#b4eba0']
      }
    ],
    asset: '/media/SEEK_THE_FOREST_1.gif'
  },
  {
    username: 'us_us_us',
    password: '18',
    data: { theme: 'hint', displayName: 'Us User' },
    hints: [
      { type: 'text', message: 'Count upward; your code lives between 17 and 19.' },
      {
        type: 'palette',
        message: 'Collective stripes rotate – green leads followed by pink, brown, blue.',
        palette: ['#b4eba0', '#f7a2b0', '#b88369', '#c8d3ee']
      },
      { type: 'text', message: 'Say the smallest age that qualifies for adulthood in many places.' },
      {
        type: 'palette',
        message: 'Crowd chant colors: brown megaphone before blue echo.',
        palette: ['#b4eba0', '#b88369', '#c8d3ee', '#f7a2b0']
      }
    ],
    asset: '/media/us_us_us.png'
  },
  {
    username: 'computer',
    password: 'DELETE',
    data: { theme: 'mystery', displayName: 'Computer User' },
    hints: [
      { type: 'text', message: 'Look down at the key that wipes text from the screen.' },
      {
        type: 'palette',
        message: 'Terminal stripes flicker – blue anchors, green closes, brown/pink inside.',
        palette: ['#c8d3ee', '#b4eba0', '#b88369', '#f7a2b0']
      },
      { type: 'text', message: 'Uppercase the button label you hammer when clearing a sentence.' },
      {
        type: 'palette',
        message: 'CRT glow: green cursor first, blue beam, pink sparks, brown casing.',
        palette: ['#b4eba0', '#c8d3ee', '#f7a2b0', '#b88369']
      }
    ],
    asset: '/media/SEEK_THE_FOREST_1.gif'
  },
  {
    username: 'holoville',
    password: 'ignite',
    data: { theme: 'mystery', displayName: 'Universal account' },
    hints: [
      { type: 'text', message: 'Light a spark — the verb you need sets things ablaze.' },
      {
        type: 'palette',
        message: 'Universal stripes flare – pink, brown, blue, green now.',
        palette: ['#f7a2b0', '#b88369', '#c8d3ee', '#b4eba0']
      },
      { type: 'text', message: 'Picture the moment a match touches tinder; say that action aloud.' },
      {
        type: 'palette',
        message: 'Flare order: orange-brown ember, neon pink flame, blue smoke, green afterglow.',
        palette: ['#b88369', '#f7a2b0', '#c8d3ee', '#b4eba0']
      }
    ],
    asset: '/media/universal.png'
  }
];

const specialStartIndex = RAW_PRESET_USERS.findIndex((record) => record.username === 'SOMETHINGINTERNAL');

export const PRESET_USERS = RAW_PRESET_USERS.map((record, index) => ({
  ...record,
  special: index >= specialStartIndex
}));

export type EnhancedPresetUser = (typeof PRESET_USERS)[number];

export const SPECIAL_DISPLAY_NAMES = PRESET_USERS.filter((record) => record.special).map((record) => record.data.displayName);

export const getPresetUser = (handle: string) =>
  PRESET_USERS.find((record) => record.username.toLowerCase() === handle.toLowerCase());
