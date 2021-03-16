import AdapterError from '@ember-data/adapter/error';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * @module GeneratedItem
 * The `GeneratedItem` component is the form to configure generated items related to mounts (e.g. groups, roles, users)
 *
 * @example
 * ```js
 * <GeneratedItem @model={{model}} @mode={{mode}} @itemType={{itemType/>
 * ```
 *
 * @property model=null {DS.Model} - The corresponding item model that is being configured.
 * @property mode {String} - which config mode to use. either `show`, `edit`, or `create`
 * @property itemType {String} - the type of item displayed
 *
 */

export default Component.extend({
  model: null,
  itemType: null,
  flashMessages: service(),
  router: service(),
  props: computed('model', function() {
    return this.model.serialize();
  }),
  saveModel: task(function*() {
    try {
      yield this.model.save();
    } catch (err) {
      // AdapterErrors are handled by the error-message component
      // in the form
      if (err instanceof AdapterError === false) {
        throw err;
      }
      return;
    }
    this.router.transitionTo('vault.cluster.access.method.item.list').followRedirects();
    this.flashMessages.success(`Successfully saved ${this.itemType} ${this.model.id}.`);
  }).withTestWaiter(),
  actions: {
    deleteItem() {
      this.model.destroyRecord().then(() => {
        this.router.transitionTo('vault.cluster.access.method.item.list').followRedirects();
        this.flashMessages.success(`Successfully deleted ${this.itemType} ${this.model.id}.`);
      });
    },
  },
});
