import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { singularize } from 'ember-inflector';
import layout from '../templates/components/search-select';

/**
 * @module SearchSelect
 * The `SearchSelect` is an implementation of the [ember-power-select-with-create](https://github.com/poteto/ember-cli-flash) used for form elements where options come dynamically from the API.
 * @example
 * <SearchSelect @id="group-policies" @models={{["policies/acl"]}} @onChange={{onChange}} @selectLimit={{2}} @inputValue={{get model valuePath}} @helpText="Policies associated with this group" @label="Policies" @fallbackComponent="string-list" />
 *
 * @param id {String} - The name of the form field
 * @param models {String} - An array of model types to fetch from the API.
 * @param onChange {Func} - The onchange action for this form field.
 * @param inputValue {String | Array} -  A comma-separated string or an array of strings.
 * @param label {String} - Label for this form field
 * @param fallbackComponent {String} - name of component to be rendered if the API call 403s
 * @param [backend] {String} - name of the backend if the query for options needs additional information (eg. secret backend)
 * @param [disallowNewItems=false] {Boolean} - Controls whether or not the user can add a new item if none found
 * @param [helpText] {String} - Text to be displayed in the info tooltip for this form field
 * @param [selectLimit] {Number} - A number that sets the limit to how many select options they can choose
 * @param [subText] {String} - Text to be displayed below the label
 * @param [subLabel] {String} - a smaller label below the main Label
 * @param [wildcardLabel] {String} - when you want the searchSelect component to return a count on the model for options returned when using a wildcard you must provide a label of the count e.g. role.  Should be singular.
 *
 * @param options {Array} - *Advanced usage* - `options` can be passed directly from the outside to the
 * power-select component. If doing this, `models` should not also be passed as that will overwrite the
 * passed value.
 * @param search {Func} - *Advanced usage* - Customizes how the power-select component searches for matches -
 * see the power-select docs for more information.
 *
 */
export default Component.extend({
  layout,
  'data-test-component': 'search-select',
  classNames: ['field', 'search-select'],
  store: service(),

  onChange: () => {},
  inputValue: computed(function() {
    return [];
  }),
  allOptions: null, // list of options including matched
  selectedOptions: null, // list of selected options
  options: null, // all possible options
  shouldUseFallback: false,
  shouldRenderName: false,
  disallowNewItems: false,
  init() {
    this._super(...arguments);
    this.set('selectedOptions', this.inputValue || []);
  },
  didRender() {
    this._super(...arguments);
    let { oldOptions, options, selectedOptions } = this;
    let hasFormattedInput = typeof selectedOptions.firstObject !== 'string';
    if (options && !oldOptions && !hasFormattedInput) {
      // this is the first time they've been set, so we need to format them
      this.formatOptions(options);
    }
    this.set('oldOptions', options);
  },
  formatOptions: function(options) {
    options = options.toArray().map(option => {
      option.searchText = `${option.name} ${option.id}`;
      return option;
    });
    let allOptions = options.toArray().map(option => {
      return option.id;
    });
    this.set('allOptions', allOptions); // used by filter-wildcard helper

    let formattedOptions = this.selectedOptions.map(option => {
      let matchingOption = options.findBy('id', option);
      options.removeObject(matchingOption);
      return {
        id: option,
        name: matchingOption ? matchingOption.name : option,
        searchText: matchingOption ? matchingOption.searchText : option,
      };
    });
    this.set('selectedOptions', formattedOptions);
    if (this.options) {
      options = this.options.concat(options).uniq();
    }
    this.set('options', options);
  },
  fetchOptions: task(function*() {
    if (!this.models) {
      if (this.options) {
        this.formatOptions(this.options);
      }
      return;
    }
    for (let modelType of this.models) {
      if (modelType.includes('identity')) {
        this.set('shouldRenderName', true);
      }
      try {
        let queryOptions = {};
        if (this.backend) {
          queryOptions = { backend: this.backend };
        }
        let options = yield this.store.query(modelType, queryOptions);
        this.formatOptions(options);
      } catch (err) {
        if (err.httpStatus === 404) {
          //leave options alone, it's okay
          return;
        }
        if (err.httpStatus === 403) {
          this.set('shouldUseFallback', true);
          return;
        }
        //special case for storybook
        if (this.staticOptions) {
          let options = this.staticOptions;
          this.formatOptions(options);
          return;
        }
        throw err;
      }
    }
  }).on('didInsertElement'),
  handleChange() {
    if (this.selectedOptions.length && typeof this.selectedOptions.firstObject === 'object') {
      this.onChange(Array.from(this.selectedOptions, option => option.id));
    } else {
      this.onChange(this.selectedOptions);
    }
  },
  actions: {
    onChange(val) {
      this.onChange(val);
    },
    createOption(optionId) {
      let newOption = { name: optionId, id: optionId, new: true };
      this.selectedOptions.pushObject(newOption);
      this.handleChange();
    },
    selectOption(option) {
      this.selectedOptions.pushObject(option);
      this.options.removeObject(option);
      this.handleChange();
    },
    discardSelection(selected) {
      this.selectedOptions.removeObject(selected);
      if (!selected.new) {
        this.options.pushObject(selected);
      }
      this.handleChange();
    },
    constructSuggestion(id) {
      return `Add new ${singularize(this.label)}: ${id}`;
    },
    hideCreateOptionOnSameID(id, options) {
      if (options && options.length && options.firstObject.groupName) {
        return !options.some(group => group.options.findBy('id', id));
      }
      let existingOption = this.options && (this.options.findBy('id', id) || this.options.findBy('name', id));
      if (this.disallowNewItems && !existingOption) {
        return false;
      }
      return !existingOption;
    },
  },
});
