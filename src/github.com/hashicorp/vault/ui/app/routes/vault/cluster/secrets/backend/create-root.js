import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import EditBase from './secret-edit';

let secretModel = (store, backend, key) => {
  let backendModel = store.peekRecord('secret-engine', backend);
  let modelType = backendModel.get('modelTypeForKV');
  if (modelType !== 'secret-v2') {
    let model = store.createRecord(modelType, {
      path: key,
    });
    return model;
  }
  let secret = store.createRecord(modelType);
  secret.set('engine', backendModel);
  let version = store.createRecord('secret-v2-version', {
    path: key,
  });
  secret.set('selectedVersion', version);
  return secret;
};

const transformModel = queryParams => {
  let modelType = 'transform';
  if (!queryParams || !queryParams.itemType) return modelType;

  return `${modelType}/${queryParams.itemType}`;
};

export default EditBase.extend({
  wizard: service(),
  createModel(transition) {
    const { backend } = this.paramsFor('vault.cluster.secrets.backend');
    let modelType = this.modelType(backend);
    if (modelType === 'role-ssh') {
      return this.store.createRecord(modelType, { keyType: 'ca' });
    }
    if (modelType === 'transform') {
      modelType = transformModel(transition.to.queryParams);
    }
    if (modelType !== 'secret' && modelType !== 'secret-v2') {
      if (this.wizard.featureState === 'details' && this.wizard.componentState === 'transit') {
        this.wizard.transitionFeatureMachine('details', 'CONTINUE', 'transit');
      }
      return this.store.createRecord(modelType);
    }

    return secretModel(this.store, backend, transition.to.queryParams.initialKey);
  },

  model(params, transition) {
    return hash({
      secret: this.createModel(transition),
      capabilities: {},
    });
  },
});
