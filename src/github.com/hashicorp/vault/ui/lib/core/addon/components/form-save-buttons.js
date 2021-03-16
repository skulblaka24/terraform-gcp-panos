import Component from '@ember/component';
import layout from '../templates/components/form-save-buttons';

/**
 * @module FormSaveButtons
 * `FormSaveButtons` displays a button save and a cancel button at the bottom of a form.
 *
 * @example
 * ```js
 * <FormSaveButtons @saveButtonText="Save" @isSaving={{isSaving}} @cancelLinkParams={{array
 * "foo.route"}} />
 * ```
 *
 * @param [saveButtonText="Save" {String}] - The text that will be rendered on the Save button.
 * @param [isSaving=false {Boolean}] - If the form is saving, this should be true. This will disable the save button and render a spinner on it;
 * @param [cancelLinkParams=[] {Array}] - An array of arguments used to construct a link to navigate back to when the Cancel button is clicked.
 * @param [onCancel=null {Fuction}] - If the form should call an action on cancel instead of route somewhere, the fucntion can be passed using onCancel instead of passing an array to cancelLinkParams.
 * @param [includeBox=true {Boolean}] - By default we include padding around the form with underlines. Passing this value as false will remove that padding.
 *
 */

export default Component.extend({
  layout,
  tagName: '',
});
