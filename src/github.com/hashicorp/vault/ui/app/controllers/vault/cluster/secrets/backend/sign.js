import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { set, get } from '@ember/object';

export default Controller.extend({
  store: service(),
  loading: false,
  emptyData: '{\n}',
  actions: {
    sign() {
      this.set('loading', true);
      this.model.save().finally(() => {
        this.set('loading', false);
      });
    },

    codemirrorUpdated(attr, val, codemirror) {
      codemirror.performLint();
      const hasErrors = codemirror.state.lint.marked.length > 0;

      if (!hasErrors) {
        set(this.model, attr, JSON.parse(val));
      }
    },

    updateTtl(path, val) {
      const model = this.model;
      let valueToSet = val.enabled === true ? `${val.seconds}s` : undefined;
      set(model, path, valueToSet);
    },

    newModel() {
      const model = this.model;
      const roleModel = model.get('role');
      model.unloadRecord();
      const newModel = this.store.createRecord('ssh-sign', {
        role: roleModel,
        id: `${get(roleModel, 'backend')}-${get(roleModel, 'name')}`,
      });
      this.set('model', newModel);
    },
  },
});