import { chrome } from '@mobile-next/jest-chrome'

Object.assign(global, require('@mobile-next/jest-chrome'))
global.luxon = require("luxon");
global.crypto = require("crypto");
