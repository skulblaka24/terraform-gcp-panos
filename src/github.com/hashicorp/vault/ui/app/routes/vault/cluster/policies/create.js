import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnloadModelRoute from 'vault/mixins/unload-model-route';
import UnsavedModelRoute from 'vault/mixins/unsaved-model-route';

export default Route.extend(UnloadModelRoute, UnsavedModelRoute, {
  version: service(),
  wizard: service(),
  model() {
    let policyType = this.policyType();
    if (
      policyType === 'acl' &&
      this.wizard.currentMachine === 'policies' &&
      this.wizard.featureState === 'idle'
    ) {
      this.wizard.transitionFeatureMachine(this.wizard.featureState, 'CONTINUE');
    }
    if (!this.version.hasSentinel && policyType !== 'acl') {
      return this.transitionTo('vault.cluster.policies', policyType);
    }
    return this.store.createRecord(`policy/${policyType}`, {});
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('policyType', this.policyType());
  },

  policyType() {
    return this.paramsFor('vault.cluster.policies').type;
  },
});
