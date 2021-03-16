import { create, clickable, fillable, visitable } from 'ember-cli-page-object';
import ListView from 'vault/tests/pages/components/list-view';

export default create({
  ...ListView,
  visit: visitable('/vault/secrets/:backend/list?tab=roles'),
  visitCreate: visitable('/vault/secrets/:backend/create?itemType=role'),
  createLink: clickable('[data-test-secret-create="true"]'),
  name: fillable('[data-test-input="name"]'),
  transformations: fillable('[data-test-input="transformations"'),
  submit: clickable('[data-test-role-transform-create="true"]'),
  modalConfirm: clickable('[data-test-edit-confirm-button]'),
});
