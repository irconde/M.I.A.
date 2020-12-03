export const viewport = {
  TOP: 'top',
  SIDE: 'side'
}

export const selection = {
  NO_SELECTION: -1,
  FIRST_ELEMENT: 0,
  ALL_SELECTED: 999
}

export const server = {
  FILE_SERVER_ADDRESS: "http://127.0.0.1:4002"
}

export const colors = {
  WHITE: '#FFFFFF',
  YELLOW: '#F7B500',
  LIGHT_YELLOW: '#FFE897',
  GREEN: '#87bb47',
  RED: '#961e13',
  BLUE: '#367FFF',
  DARK_BLUE: '#0C2D5A',
  LIGHT_BLUE: '#CAFFCA',
  BROWN: '#B19161',
  ORANGE: '#EA8101',
  PURPLE: '#8239D0',
  DARK_PINK: '#C73080',
  LIGHT_PINK: '#FFCAF0'
}

export const buttonStyle = {
  MARGIN_LEFT: 60,
  MARGIN_RIGHT: 250,
  GAP: 120,
  HEIGHT: 60,
  LINE_GAP: 40
}

export const detectionStyle = {
  NORMAL_COLOR: colors.BLUE,
  APPLE_COLOR: colors.LIGHT_PINK,
  ORANGE_COLOR: colors.ORANGE,
  BANANA_COLOR: colors.LIGHT_YELLOW,
  PETRI_DISH_COLOR: colors.LIGHT_BLUE,
  SAUSAGE_COLOR: colors.DARK_BLUE,
  VIALS_COLOR: colors.DARK_PINK,
  POTATO_COLOR: colors.BROWN,
  CONTACT_LENS_SOLUTION_COLOR: colors.PURPLE,
  SELECTED_COLOR: colors.YELLOW,
  VALID_COLOR: colors.GREEN,
  INVALID_COLOR: colors.RED,
  LABEL_PADDING: 4,
  LABEL_FONT: 'bold 12px Arial',
  LABEL_TEXT_COLOR: colors.WHITE,
  BORDER_WIDTH: 2
}

export const viewportStyle = {
  ZOOM: 1.5,
  ORIGIN: 25
}

export const classList = ['APPLE', 'ORANGE', 'BANANA', 'PETRI DISH',
  'CONTACT LENS SOLUTION', 'SAUSAGE', 'POTATO', 'VIALS']

export const COMMAND_SERVER = process.env.REACT_APP_COMMAND_SERVER;
export const ENABLE_NEXT = process.env.REACT_APP_ENABLE_NEXT;
