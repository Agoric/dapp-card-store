// @ts-check
import { AssetKind } from '@agoric/ertp';
import {
  stringifyValue as formatValue,
  parseAsValue,
} from '@agoric/ui-components';

/**
 * @typedef {{ assetKind?: AssetKind } & DisplayInfo} AmountDisplayInfo
 */

/**
 *
 * @param {string} value
 * @param {AmountDisplayInfo} [displayInfo]
 * @returns {Value}
 */
export function makeValue(value, displayInfo) {
  const { assetKind = AssetKind.NAT, decimalPlaces = 0 } = displayInfo || {};
  return parseAsValue(value, assetKind, decimalPlaces);
}

/**
 *
 * @param {any} value
 * @param {AmountDisplayInfo} [displayInfo]
 * @returns {string}
 * This is borrowed from wallet ui
 */
export function stringifyValue(value, displayInfo) {
  const { assetKind = AssetKind.NAT, decimalPlaces = 0 } = displayInfo || {};
  return formatValue(value, assetKind, decimalPlaces, decimalPlaces);
}
