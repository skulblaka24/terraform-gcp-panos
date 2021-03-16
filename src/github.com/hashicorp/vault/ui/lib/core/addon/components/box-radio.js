/**
 * @module BoxRadio
 * BoxRadio components are used to display options for a radio selection.
 *
 * @example
 * ```js
 * <BoxRadio @displayName="Catahoula Leopard" @type="catahoula" @glyph="dog" @groupValue="labrador" @groupName="my-favorite-dog" @onRadioChange={{handleRadioChange}} />
 * ```
 * @param {string} displayName - This is the string that will show on the box radio option.
 * @param {string} type - type is the key that the radio input will be identified by. Please use a value without spaces.
 * @param {string} glyph - glyph is the name of the icon that will be used in the box
 * @param {string} groupValue - The key of the radio option that is currently selected for this radio group
 * @param {string} groupName - The name (key) of the group that this radio option belongs to
 * @param {function} onRadioChange - This callback will trigger when the radio option is selected (if enabled)
 * @param {boolean} [disabled=false] - This parameter controls whether the radio option is selectable. If not, it will be grayed out and show a tooltip.
 * @param {string} [tooltipMessage=default] - The message that shows in the tooltip if the radio option is disabled
 */

import Component from '@glimmer/component';
import layout from '../templates/components/box-radio';
import { setComponentTemplate } from '@ember/component';

class BoxRadio extends Component {
  disabled = false;
  tooltipMessage = 'This option is not available to you at this time.';
}

export default setComponentTemplate(layout, BoxRadio);
