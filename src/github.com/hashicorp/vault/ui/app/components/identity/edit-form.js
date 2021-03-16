import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { humanize } from 'vault/helpers/humanize';

export default Component.extend({
  flashMessages: service(),
  'data-test-component': 'identity-edit-form',
  model: null,

  // 'create', 'edit', 'merge'
  mode: 'create',
  /*
   * @param Function
   * @public
   *
   * Optional param to call a function upon successfully saving an entity
   */
  onSave: () => {},

  cancelLink: computed('mode', 'model.identityType', function() {
    let { model, mode } = this;
    let routes = {
      'create-entity': 'vault.cluster.access.identity',
      'edit-entity': 'vault.cluster.access.identity.show',
      'merge-entity-merge': 'vault.cluster.access.identity',
      'create-entity-alias': 'vault.cluster.access.identity.aliases',
      'edit-entity-alias': 'vault.cluster.access.identity.aliases.show',
      'create-group': 'vault.cluster.access.identity',
      'edit-group': 'vault.cluster.access.identity.show',
      'create-group-alias': 'vault.cluster.access.identity.aliases',
      'edit-group-alias': 'vault.cluster.access.identity.aliases.show',
    };
    let key = model ? `${mode}-${model.identityType}` : 'merge-entity-alias';
    return routes[key];
  }),

  getMessage(model, isDelete = false) {
    let mode = this.mode;
    let typeDisplay = humanize([model.identityType]);
    let action = isDelete ? 'deleted' : 'saved';
    if (mode === 'merge') {
      return 'Successfully merged entities';
    }
    if (model.id) {
      return `Successfully ${action} ${typeDisplay} ${model.id}.`;
    }
    return `Successfully ${action} ${typeDisplay}.`;
  },

  save: task(function*() {
    let model = this.model;
    let message = this.getMessage(model);

    try {
      yield model.save();
    } catch (err) {
      // err will display via model state
      return;
    }
    this.flashMessages.success(message);
    yield this.onSave({ saveType: 'save', model });
  })
    .drop()
    .withTestWaiter(),

  willDestroy() {
    let model = this.model;
    if (!model) return;
    if ((model.get('isDirty') && !model.isDestroyed) || !model.isDestroying) {
      model.rollbackAttributes();
    }
  },

  actions: {
    deleteItem(model) {
      let message = this.getMessage(model, true);
      let flash = this.flashMessages;
      model.destroyRecord().then(() => {
        flash.success(message);
        return this.onSave({ saveType: 'delete', model });
      });
    },
  },
});
