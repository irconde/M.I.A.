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
  FILE_SERVER_ADDRESS: "http://127.0.0.1:4002",
  PROTOCOL: 'http://',
  FILE_SERVER_PORT: ':4002'
}

export const colors = {
  WHITE: '#FFFFFF',
  YELLOW: '#F7B500',
  GREEN: '#87bb47',
  RED: '#961e13',
  BLUE: '#367FFF'
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
  SELECTED_COLOR: colors.BLUE,
  VALID_COLOR: colors.GREEN,
  INVALID_COLOR: colors.RED,
  LABEL_PADDING: 4,
  LABEL_FONT: 'bold 12px Arial',
  LABEL_TEXT_COLOR: colors.WHITE,
  BORDER_WIDTH: 2
}

export const viewportStyle = {
  ZOOM: 1.2,
  ORIGIN: 25
}

export const COMMAND_SERVER = process.env.REACT_APP_COMMAND_SERVER;
export const ENABLE_NEXT = process.env.REACT_APP_ENABLE_NEXT;
export const PROTOCOL = 'http://';
export const FILE_SERVER_PORT = ':4002';
